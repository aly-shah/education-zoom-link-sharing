"use client";

import { useActionState, useRef } from "react";
import { createClassAction } from "@/lib/actions";

export default function NewClassForm() {
  const ref = useRef<HTMLFormElement>(null);
  const [message, action, pending] = useActionState(
    async (prev: string | null, formData: FormData) => {
      const result = await createClassAction(prev, formData);
      ref.current?.reset();
      return result;
    },
    null
  );

  return (
    <form ref={ref} action={action} className="grid gap-3 sm:grid-cols-2">
      <input name="title" placeholder="Class title" required />
      <input
        name="zoom_link"
        type="url"
        placeholder="Zoom link"
        required
      />
      <label className="text-xs text-neutral-500">
        Starts
        <input name="starts_at" type="datetime-local" required />
      </label>
      <label className="text-xs text-neutral-500">
        Ends
        <input name="ends_at" type="datetime-local" required />
      </label>
      {message && (
        <p className="text-sm text-amber-700 sm:col-span-2">{message}</p>
      )}
      <div className="sm:col-span-2">
        <button
          disabled={pending}
          className="rounded-md bg-neutral-900 px-4 py-2 text-sm text-white disabled:opacity-50"
        >
          {pending ? "Scheduling…" : "Schedule class"}
        </button>
      </div>
    </form>
  );
}
