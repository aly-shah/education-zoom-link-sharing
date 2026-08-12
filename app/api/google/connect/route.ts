import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { GOOGLE_ENABLED, authUrl } from "@/lib/google";

export async function GET() {
  const user = await currentUser();
  if (!user || user.role !== "teacher" || !GOOGLE_ENABLED) {
    return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"));
  }
  return NextResponse.redirect(authUrl(String(user.id)));
}
