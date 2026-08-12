import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { formatRange } from "@/lib/format";
import Shell from "../shell";

type Row = {
  id: number;
  title: string;
  starts_at: string;
  ends_at: string;
  zoom_link: string;
  teacher: string;
};

export default async function StudentPage() {
  const student = await currentUser();
  if (!student) redirect("/login");
  if (student.role !== "student") redirect(`/${student.role}`);

  const classes = db
    .prepare(
      `SELECT c.id, c.title, c.starts_at, c.ends_at, c.zoom_link, u.name AS teacher
       FROM classes c JOIN users u ON u.id = c.teacher_id
       WHERE c.ends_at >= ? ORDER BY c.starts_at`
    )
    .all(new Date().toISOString().slice(0, 16)) as Row[];

  return (
    <Shell title={student.name} subtitle="Upcoming classes">
      <ul className="divide-y divide-neutral-200 border-t border-neutral-200">
        {classes.map((c) => (
          <li key={c.id} className="flex items-center justify-between py-4">
            <div>
              <p className="text-sm font-medium">{c.title}</p>
              <p className="text-xs text-neutral-500">
                {formatRange(c.starts_at, c.ends_at)} · {c.teacher}
              </p>
            </div>
            <a
              href={c.zoom_link}
              target="_blank"
              rel="noreferrer"
              className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white"
            >
              Join
            </a>
          </li>
        ))}
        {classes.length === 0 && (
          <li className="py-4 text-sm text-neutral-500">
            No classes scheduled.
          </li>
        )}
      </ul>
    </Shell>
  );
}
