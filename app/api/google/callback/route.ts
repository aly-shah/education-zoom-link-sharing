import { NextResponse, type NextRequest } from "next/server";
import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { oauthClient } from "@/lib/google";

export async function GET(req: NextRequest) {
  const base = process.env.APP_URL || "http://localhost:3000";
  const code = req.nextUrl.searchParams.get("code");
  const state = req.nextUrl.searchParams.get("state");
  const user = await currentUser();

  if (!code || !user || user.role !== "teacher" || state !== String(user.id)) {
    return NextResponse.redirect(new URL("/teacher", base));
  }

  const { tokens } = await oauthClient().getToken(code);
  if (tokens.refresh_token) {
    db.prepare("UPDATE users SET google_refresh_token = ? WHERE id = ?").run(
      tokens.refresh_token,
      user.id
    );
  }
  return NextResponse.redirect(new URL("/teacher", base));
}
