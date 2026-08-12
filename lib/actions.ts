"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db, type ClassRow } from "./db";
import { hash, login, logout, requireRole } from "./auth";
import { GOOGLE_ENABLED, createEvent, deleteEvent } from "./google";

export async function loginAction(_: string | null, formData: FormData) {
  const user = await login(
    String(formData.get("email") || ""),
    String(formData.get("password") || "")
  );
  if (!user) return "Invalid email or password.";
  redirect(`/${user.role}`);
}

export async function logoutAction() {
  await logout();
  redirect("/login");
}

export async function createUserAction(_: string | null, formData: FormData) {
  await requireRole("admin");
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim().toLowerCase();
  const password = String(formData.get("password") || "");
  const role = String(formData.get("role") || "");
  if (!name || !email || password.length < 6) return "Fill all fields (password 6+ chars).";
  if (role !== "teacher" && role !== "student") return "Pick a role.";
  try {
    db.prepare(
      "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)"
    ).run(name, email, hash(password), role);
  } catch {
    return "That email is already used.";
  }
  revalidatePath("/admin");
  return null;
}

export async function deleteUserAction(formData: FormData) {
  await requireRole("admin");
  db.prepare("DELETE FROM users WHERE id = ? AND role != 'admin'").run(
    Number(formData.get("id"))
  );
  revalidatePath("/admin");
}

export async function createClassAction(_: string | null, formData: FormData) {
  const teacher = await requireRole("teacher");
  const title = String(formData.get("title") || "").trim();
  const startsAt = String(formData.get("starts_at") || "");
  const endsAt = String(formData.get("ends_at") || "");
  const zoomLink = String(formData.get("zoom_link") || "").trim();
  if (!title || !startsAt || !endsAt || !zoomLink) return "Fill all fields.";
  if (new Date(endsAt) <= new Date(startsAt)) return "End time must be after start time.";

  let eventId: string | null = null;
  let warning: string | null = null;
  if (GOOGLE_ENABLED && teacher.google_refresh_token) {
    try {
      eventId = await createEvent(teacher.google_refresh_token, {
        title,
        startsAt,
        endsAt,
        zoomLink,
      });
    } catch {
      warning = "Class saved, but Google Calendar sync failed.";
    }
  }

  db.prepare(
    "INSERT INTO classes (teacher_id, title, starts_at, ends_at, zoom_link, google_event_id) VALUES (?, ?, ?, ?, ?, ?)"
  ).run(teacher.id, title, startsAt, endsAt, zoomLink, eventId);
  revalidatePath("/teacher");
  return warning;
}

export async function deleteClassAction(formData: FormData) {
  const teacher = await requireRole("teacher");
  const row = db
    .prepare("SELECT * FROM classes WHERE id = ? AND teacher_id = ?")
    .get(Number(formData.get("id")), teacher.id) as ClassRow | undefined;
  if (!row) return;
  if (row.google_event_id && teacher.google_refresh_token) {
    try {
      await deleteEvent(teacher.google_refresh_token, row.google_event_id);
    } catch {}
  }
  db.prepare("DELETE FROM classes WHERE id = ?").run(row.id);
  revalidatePath("/teacher");
}

export async function disconnectGoogleAction() {
  const teacher = await requireRole("teacher");
  db.prepare("UPDATE users SET google_refresh_token = NULL WHERE id = ?").run(
    teacher.id
  );
  revalidatePath("/teacher");
}
