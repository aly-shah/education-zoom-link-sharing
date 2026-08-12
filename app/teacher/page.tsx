import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, type ClassRow } from "@/lib/db";
import { deleteClassAction, disconnectGoogleAction } from "@/lib/actions";
import { GOOGLE_ENABLED } from "@/lib/google";
import { formatRange } from "@/lib/format";
import Shell from "../shell";
import NewClassForm from "./form";

export default async function TeacherPage() {
  const teacher = await currentUser();
  if (!teacher) redirect("/login");
  if (teacher.role !== "teacher") redirect(`/${teacher.role}`);

  const classes = db
    .prepare("SELECT * FROM classes WHERE teacher_id = ? ORDER BY starts_at")
    .all(teacher.id) as ClassRow[];

  const connected = Boolean(teacher.google_refresh_token);

  return (
    <Shell title={teacher.name} subtitle="Teacher portal">
      <div className="mb-6 flex items-center justify-between rounded-md border border-neutral-200 px-4 py-3 text-sm">
        <span className="text-neutral-600">
          {!GOOGLE_ENABLED
            ? "Google Calendar not configured"
            : connected
              ? "Google Calendar connected"
              : "Google Calendar not connected"}
        </span>
        {GOOGLE_ENABLED &&
          (connected ? (
            <form action={disconnectGoogleAction}>
              <button className="text-neutral-400 hover:text-red-600">
                Disconnect
              </button>
            </form>
          ) : (
            <a href="/api/google/connect" className="underline">
              Connect
            </a>
          ))}
      </div>

      <NewClassForm />

      <ul className="mt-8 divide-y divide-neutral-200 border-t border-neutral-200">
        {classes.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs text-neutral-500">
                {formatRange(c.starts_at, c.ends_at)}
              </p>
              <a
                href={c.zoom_link}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-600 underline"
              >
                Zoom link
              </a>
            </div>
            <form action={deleteClassAction}>
              <input type="hidden" name="id" value={c.id} />
              <button className="text-xs text-neutral-400 hover:text-red-600">
                Remove
              </button>
            </form>
          </li>
        ))}
        {classes.length === 0 && (
          <li className="py-3 text-sm text-neutral-500">
            No classes scheduled.
          </li>
        )}
      </ul>
    </Shell>
  );
}
