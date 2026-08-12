import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { db, type User } from "@/lib/db";
import { deleteUserAction } from "@/lib/actions";
import Shell from "../shell";
import NewUserForm from "./form";

export default async function AdminPage() {
  const admin = await currentUser();
  if (!admin) redirect("/login");
  if (admin.role !== "admin") redirect(`/${admin.role}`);

  const users = db
    .prepare(
      "SELECT * FROM users WHERE role != 'admin' ORDER BY role DESC, name"
    )
    .all() as User[];

  return (
    <Shell title="Admin" subtitle="Teachers and students">
      <NewUserForm />

      <ul className="mt-8 divide-y divide-neutral-200 border-t border-neutral-200">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between py-3">
            <div>
              <p className="text-sm font-medium">{u.name}</p>
              <p className="text-xs text-neutral-500">
                {u.email} · {u.role}
              </p>
            </div>
            <form action={deleteUserAction}>
              <input type="hidden" name="id" value={u.id} />
              <button className="text-xs text-neutral-400 hover:text-red-600">
                Remove
              </button>
            </form>
          </li>
        ))}
        {users.length === 0 && (
          <li className="py-3 text-sm text-neutral-500">No users yet.</li>
        )}
      </ul>
    </Shell>
  );
}
