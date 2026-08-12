# School CRM

Minimal Next.js CRM with three portals: **admin**, **teacher**, **student**.

- Admin creates teachers and students.
- Teachers optionally connect their Google Calendar, then schedule a class with a Zoom link. Each class is written to their Google Calendar (Zoom link in the location + description).
- Students see the list of upcoming classes with timings and a **Join** button that opens the Zoom link.

## Stack

Next.js (App Router) · SQLite (better-sqlite3) · Tailwind · cookie sessions · Google Calendar API.

## Setup

```bash
cp .env.example .env.local   # already done for local dev
npm run dev
```

Open http://localhost:3000 and sign in with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env.local`
(default `admin@school.test` / `admin123`). The admin account is created on first run.

Data lives in `crm.db` (git-ignored). Delete the file to reset.

## Google Calendar (optional)

1. Google Cloud Console → **APIs & Services** → enable **Google Calendar API**.
2. **Credentials** → **Create credentials** → **OAuth client ID** → *Web application*.
3. Authorized redirect URI: `http://localhost:3000/api/google/callback`.
4. Put the client ID/secret in `.env.local` and restart.

A teacher then clicks **Connect** in their portal once. Without this, classes still work — they're
just stored in the app instead of also appearing on Google Calendar.

## Zoom

Zoom links are pasted in by the teacher (from a scheduled Zoom meeting). No Zoom API keys needed.

## Routes

| Path | Who |
| --- | --- |
| `/login` | everyone |
| `/admin` | create/remove teachers and students |
| `/teacher` | connect calendar, schedule classes |
| `/student` | upcoming classes, join links |
