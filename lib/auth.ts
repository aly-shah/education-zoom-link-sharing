import { cookies } from "next/headers";
import crypto from "node:crypto";
import bcrypt from "bcryptjs";
import { db, type Role, type User } from "./db";

const SECRET = process.env.SESSION_SECRET || "dev-secret-change-me";
const COOKIE = "session";

function sign(value: string) {
  return crypto.createHmac("sha256", SECRET).update(value).digest("hex");
}

export function seedAdmin() {
  const email = (process.env.ADMIN_EMAIL || "admin@school.test").toLowerCase();
  const exists = db.prepare("SELECT id FROM users WHERE role = 'admin'").get();
  if (exists) return;
  db.prepare(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, 'admin')"
  ).run(
    "Admin",
    email,
    bcrypt.hashSync(process.env.ADMIN_PASSWORD || "admin123", 10)
  );
}

export async function login(email: string, password: string) {
  seedAdmin();
  const user = db
    .prepare("SELECT * FROM users WHERE email = ?")
    .get(email.trim().toLowerCase()) as User | undefined;
  if (!user || !bcrypt.compareSync(password, user.password)) return null;
  const value = `${user.id}.${sign(String(user.id))}`;
  (await cookies()).set(COOKIE, value, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return user;
}

export async function logout() {
  (await cookies()).delete(COOKIE);
}

export async function currentUser(): Promise<User | null> {
  const raw = (await cookies()).get(COOKIE)?.value;
  if (!raw) return null;
  const [id, sig] = raw.split(".");
  if (!id || sig !== sign(id)) return null;
  return (db.prepare("SELECT * FROM users WHERE id = ?").get(Number(id)) as
    | User
    | undefined) ?? null;
}

export async function requireRole(role: Role): Promise<User> {
  const user = await currentUser();
  if (!user || user.role !== role) throw new Error("Unauthorized");
  return user;
}

export const hash = (p: string) => bcrypt.hashSync(p, 10);
