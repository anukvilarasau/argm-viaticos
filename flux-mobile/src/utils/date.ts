export function getTodayKey() {
  return new Date().toISOString().slice(0, 10);
}

function toLocalDate(date: string) {
  return new Date(`${date}T12:00:00`);
}

export function formatLongDate(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(toLocalDate(date));
}

export function formatMonthLabel(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(toLocalDate(date));
}

export function formatMonthShort(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
  }).format(toLocalDate(date));
}

export function formatWeekdayShort(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    weekday: "short",
  })
    .format(toLocalDate(date))
    .replace(".", "");
}

export function formatDayNumber(date: string) {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
  }).format(toLocalDate(date));
}

export function addDaysToIso(date: string, amount: number) {
  const next = toLocalDate(date);
  next.setDate(next.getDate() + amount);
  return next.toISOString().slice(0, 10);
}

export function getWeekDates(date: string) {
  const current = toLocalDate(date);
  const day = current.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  const start = new Date(current);
  start.setDate(current.getDate() + diff);

  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return next.toISOString().slice(0, 10);
  });
}

export function timeToMinutes(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  if (Number.isNaN(hour) || Number.isNaN(minute)) {
    return null;
  }

  return hour * 60 + minute;
}

export function toGoogleDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}
