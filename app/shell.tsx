import { logoutAction } from "@/lib/actions";

export default function Shell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <header className="mb-8 flex items-baseline justify-between border-b border-neutral-200 pb-4">
        <div>
          <h1 className="text-xl font-semibold">{title}</h1>
          {subtitle && (
            <p className="text-sm text-neutral-500">{subtitle}</p>
          )}
        </div>
        <form action={logoutAction}>
          <button className="text-sm text-neutral-500 hover:text-neutral-900">
            Sign out
          </button>
        </form>
      </header>
      {children}
    </main>
  );
}
