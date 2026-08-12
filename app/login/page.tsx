import { redirect } from "next/navigation";
import { currentUser, seedAdmin } from "@/lib/auth";
import LoginForm from "./form";

export default async function LoginPage() {
  seedAdmin();
  const user = await currentUser();
  if (user) redirect(`/${user.role}`);
  return (
    <main className="mx-auto flex min-h-screen max-w-sm flex-col justify-center px-6">
      <h1 className="mb-6 text-xl font-semibold">School CRM</h1>
      <LoginForm />
    </main>
  );
}
