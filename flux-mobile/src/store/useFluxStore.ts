import { create } from "zustand";

import { initialGoals, initialMessages, initialTimeline } from "../data/mockData";
import { AgendaDay, ChatMessage, Goal, ISODateString, TimelineEvent } from "../types";
import { getTodayKey } from "../utils/date";

type NewGoalInput = {
  title: string;
  duration: string;
};

type NewTimelineInput = {
  time: string;
  title: string;
  description: string;
  tags: string[];
  category: TimelineEvent["category"];
};

type FluxState = {
  agendaByDate: Record<ISODateString, AgendaDay>;
  messages: ChatMessage[];
  selectedDate: ISODateString;
  setSelectedDate: (date: ISODateString) => void;
  toggleGoal: (goalId: string) => void;
  addGoal: (input: NewGoalInput) => void;
  removeGoal: (goalId: string) => void;
  addTimelineEvent: (input: NewTimelineInput) => void;
  removeTimelineEvent: (eventId: string) => void;
  importTimelineEvents: (date: ISODateString, events: TimelineEvent[]) => void;
  quickLog: () => void;
  addMessage: (message: ChatMessage) => void;
};

const tones: Goal["tone"][] = ["mint", "sky", "peach", "lilac"];
const todayKey = getTodayKey();

function sortTimeline(timeline: TimelineEvent[]) {
  return [...timeline].sort((left, right) => left.time.localeCompare(right.time));
}

function ensureDay(agendaByDate: Record<ISODateString, AgendaDay>, date: ISODateString) {
  return agendaByDate[date] ?? { goals: [], timeline: [] };
}

function currentTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const useFluxStore = create<FluxState>((set) => ({
  agendaByDate: {
    [todayKey]: {
      goals: initialGoals,
      timeline: initialTimeline,
    },
  },
  messages: initialMessages,
  selectedDate: todayKey,
  setSelectedDate: (date) => set(() => ({ selectedDate: date })),
  toggleGoal: (goalId) =>
    set((state) => ({
      agendaByDate: {
        ...state.agendaByDate,
        [state.selectedDate]: {
          ...ensureDay(state.agendaByDate, state.selectedDate),
          goals: ensureDay(state.agendaByDate, state.selectedDate).goals.map((goal) =>
            goal.id === goalId ? { ...goal, completed: !goal.completed } : goal,
          ),
        },
      },
    })),
  addGoal: ({ title, duration }) =>
    set((state) => {
      const currentDay = ensureDay(state.agendaByDate, state.selectedDate);

      if (currentDay.goals.length >= 5) {
        return state;
      }

      return {
        agendaByDate: {
          ...state.agendaByDate,
          [state.selectedDate]: {
            ...currentDay,
            goals: [
              ...currentDay.goals,
              {
                id: `goal-${Date.now()}`,
                title,
                duration,
                completed: false,
                tone: tones[currentDay.goals.length % tones.length],
              },
            ],
          },
        },
      };
    }),
  removeGoal: (goalId) =>
    set((state) => ({
      agendaByDate: {
        ...state.agendaByDate,
        [state.selectedDate]: {
          ...ensureDay(state.agendaByDate, state.selectedDate),
          goals: ensureDay(state.agendaByDate, state.selectedDate).goals.filter((goal) => goal.id !== goalId),
        },
      },
    })),
  addTimelineEvent: ({ time, title, description, tags, category }) =>
    set((state) => {
      const currentDay = ensureDay(state.agendaByDate, state.selectedDate);

      return {
        agendaByDate: {
          ...state.agendaByDate,
          [state.selectedDate]: {
            ...currentDay,
            timeline: sortTimeline([
              ...currentDay.timeline,
              {
                id: `event-${Date.now()}`,
                time,
                title,
                description,
                tags,
                category,
              },
            ]),
          },
        },
      };
    }),
  removeTimelineEvent: (eventId) =>
    set((state) => ({
      agendaByDate: {
        ...state.agendaByDate,
        [state.selectedDate]: {
          ...ensureDay(state.agendaByDate, state.selectedDate),
          timeline: ensureDay(state.agendaByDate, state.selectedDate).timeline.filter((event) => event.id !== eventId),
        },
      },
    })),
  importTimelineEvents: (date, events) =>
    set((state) => {
      const currentDay = ensureDay(state.agendaByDate, date);

      return {
        agendaByDate: {
          ...state.agendaByDate,
          [date]: {
            ...currentDay,
            timeline: sortTimeline([
              ...currentDay.timeline.filter((event) => !event.tags.includes("#google")),
              ...events,
            ]),
          },
        },
      };
    }),
  quickLog: () =>
    set((state) => {
      const currentDay = ensureDay(state.agendaByDate, state.selectedDate);

      return {
        agendaByDate: {
          ...state.agendaByDate,
          [state.selectedDate]: {
            ...currentDay,
            timeline: sortTimeline([
              ...currentDay.timeline,
              {
                id: `event-${Date.now()}`,
                time: currentTimeLabel(),
                title: "Quick capture",
                description: "A fast placeholder so you can refine the block in seconds.",
                tags: ["#quicklog"],
                category: "focus",
              },
            ]),
          },
        },
      };
    }),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));
