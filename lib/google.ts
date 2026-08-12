import { google } from "googleapis";

export const GOOGLE_ENABLED = Boolean(
  process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
);

export function oauthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${process.env.APP_URL || "http://localhost:3000"}/api/google/callback`
  );
}

export function authUrl(state: string) {
  return oauthClient().generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: ["https://www.googleapis.com/auth/calendar.events"],
    state,
  });
}

function calendarFor(refreshToken: string) {
  const auth = oauthClient();
  auth.setCredentials({ refresh_token: refreshToken });
  return google.calendar({ version: "v3", auth });
}

export async function createEvent(
  refreshToken: string,
  ev: { title: string; startsAt: string; endsAt: string; zoomLink: string }
) {
  const res = await calendarFor(refreshToken).events.insert({
    calendarId: "primary",
    requestBody: {
      summary: ev.title,
      location: ev.zoomLink,
      description: `Join Zoom: ${ev.zoomLink}`,
      start: { dateTime: new Date(ev.startsAt).toISOString() },
      end: { dateTime: new Date(ev.endsAt).toISOString() },
    },
  });
  return res.data.id ?? null;
}

export async function deleteEvent(refreshToken: string, eventId: string) {
  await calendarFor(refreshToken).events.delete({
    calendarId: "primary",
    eventId,
  });
}
