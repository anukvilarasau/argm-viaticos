export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

export function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function formatMonthLabel(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(`${date}T12:00:00`));
}

export function toGoogleDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}
