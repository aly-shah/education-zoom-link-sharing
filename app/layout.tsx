import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "School CRM",
  description: "Admin, teacher and student portals",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
