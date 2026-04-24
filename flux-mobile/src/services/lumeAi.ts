import { TimelineEvent } from "../types";

export type SuggestedChange = {
  title: string;
  reason: string;
};

export function analyzeSchedule(events: TimelineEvent[]): SuggestedChange[] {
  const focusCount = events.filter((event) => event.category === "focus").length;
  const lateEvents = events.filter((event) => Number(event.time.split(":")[0]) >= 16).length;

  return [
    {
      title: focusCount < 2 ? "Add one protected focus block" : "Keep your focus rhythm steady",
      reason: focusCount < 2 ? "Your timeline only has one deep-work entry today." : "You already have solid momentum for maker time.",
    },
    {
      title: lateEvents > 1 ? "Reduce late-day switching" : "Afternoon looks balanced",
      reason: lateEvents > 1 ? "Stacking multiple late activities could drain evening energy." : "You have room for one more high-value task after lunch.",
    },
  ];
}

export async function generateLumeReply(input: string, events: TimelineEvent[]) {
  const suggestions = analyzeSchedule(events);
  const lead = input.toLowerCase().includes("plan")
    ? "Here is a lighter plan I would try:"
    : "Based on your timeline, here is my suggestion:";

  return `${lead} ${suggestions[0].title}. ${suggestions[0].reason} ${suggestions[1].title}. ${suggestions[1].reason}`;
}
