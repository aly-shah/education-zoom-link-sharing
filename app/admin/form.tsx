"use client";

import { useActionState, useRef } from "react";
import { createUserAction } from "@/lib/actions";

export default function NewUserForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [error, action, pending] = useActionState(
    async (prev: string | null, formData: FormData) => {
      const result = await createUserAction(prev, formData);
      if (!result) ref.current?.reset();
      return result;
    },
    null
  );

  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-2">
      <input name="name" placeholder="Full name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input
        name="password"
        type="password"
        placeholder="Password"
        minLength={6}
        required
      />
      <select name="role" defaultValue="student" required>
        <option value="student">Student</option>
        <option value="teacher">Teacher</option>
      </select>
      {error && (
        <p className="text-sm text-red-600 sm:col-span-2">{error}</p>
      )}
      <div className="sm:col-span-2">
        <button
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? "Adding…" : "Add user"}
        </button>
      </div>
    </form>
  );
}
