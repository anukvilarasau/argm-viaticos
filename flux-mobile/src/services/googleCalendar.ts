import { TimelineEvent } from "../types";
import { toGoogleDateTime } from "../utils/date";

const GOOGLE_CALENDAR_BASE_URL = "https://www.googleapis.com/calendar/v3";

export const googleCalendarScopes = [
  "openid",
  "profile",
  "email",
  "https://www.googleapis.com/auth/calendar.events",
  "https://www.googleapis.com/auth/calendar.readonly",
];

export async function fetchGoogleProfile(accessToken: string) {
  const response = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load Google profile.");
  }

  return response.json();
}

export async function listGoogleCalendarEventsForDate(accessToken: string, date: string) {
  const timeMin = new Date(`${date}T00:00:00`).toISOString();
  const timeMax = new Date(`${date}T23:59:59`).toISOString();
  const url = `${GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${encodeURIComponent(
    timeMin,
  )}&timeMax=${encodeURIComponent(timeMax)}`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Unable to load events from Google Calendar.");
  }

  const payload = await response.json();
  return (payload.items ?? []).map((item: any, index: number) => {
    const start = item.start?.dateTime ?? `${date}T09:00:00`;
    const startDate = new Date(start);

    return {
      id: `google-${item.id ?? index}`,
      time: startDate.toISOString().slice(11, 16),
      title: item.summary ?? "Google Calendar event",
      description: item.description ?? "Imported from Google Calendar.",
      tags: ["#google"],
      category: "work" as const,
    };
  });
}

export async function createGoogleCalendarEvent(accessToken: string, date: string, event: TimelineEvent) {
  const start = toGoogleDateTime(date, event.time);
  const endDate = new Date(new Date(start).getTime() + 45 * 60 * 1000).toISOString();

  const response = await fetch(`${GOOGLE_CALENDAR_BASE_URL}/calendars/primary/events`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: event.title,
      description: `${event.description}\n\n${event.tags.join(" ")}`.trim(),
      start: { dateTime: start },
      end: { dateTime: endDate },
    }),
  });

  if (!response.ok) {
    throw new Error("Unable to create an event in Google Calendar.");
  }

  return response.json();
}
