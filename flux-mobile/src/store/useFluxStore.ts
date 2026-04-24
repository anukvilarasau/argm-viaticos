import { create } from "zustand";

import { initialGoals, initialMessages, initialTimeline } from "../data/mockData";
import { ChatMessage, Goal, TimelineEvent } from "../types";

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
  goals: Goal[];
  timeline: TimelineEvent[];
  messages: ChatMessage[];
  toggleGoal: (goalId: string) => void;
  addGoal: (input: NewGoalInput) => void;
  removeGoal: (goalId: string) => void;
  addTimelineEvent: (input: NewTimelineInput) => void;
  removeTimelineEvent: (eventId: string) => void;
  quickLog: () => void;
  addMessage: (message: ChatMessage) => void;
};

const tones: Goal["tone"][] = ["mint", "sky", "peach", "lilac"];

function currentTimeLabel() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export const useFluxStore = create<FluxState>((set) => ({
  goals: initialGoals,
  timeline: initialTimeline,
  messages: initialMessages,
  toggleGoal: (goalId) =>
    set((state) => ({
      goals: state.goals.map((goal) =>
        goal.id === goalId ? { ...goal, completed: !goal.completed } : goal,
      ),
    })),
  addGoal: ({ title, duration }) =>
    set((state) => ({
      goals:
        state.goals.length >= 5
          ? state.goals
          : [
              ...state.goals,
              {
                id: `goal-${Date.now()}`,
                title,
                duration,
                completed: false,
                tone: tones[state.goals.length % tones.length],
              },
            ],
    })),
  removeGoal: (goalId) =>
    set((state) => ({
      goals: state.goals.filter((goal) => goal.id !== goalId),
    })),
  addTimelineEvent: ({ time, title, description, tags, category }) =>
    set((state) => ({
      timeline: [
        ...state.timeline,
        {
          id: `event-${Date.now()}`,
          time,
          title,
          description,
          tags,
          category,
        },
      ].sort((left, right) => left.time.localeCompare(right.time)),
    })),
  removeTimelineEvent: (eventId) =>
    set((state) => ({
      timeline: state.timeline.filter((event) => event.id !== eventId),
    })),
  quickLog: () =>
    set((state) => ({
      timeline: [
        {
          id: `event-${Date.now()}`,
          time: currentTimeLabel(),
          title: "Quick capture",
          description: "A fast placeholder so you can refine the block in seconds.",
          tags: ["#quicklog"],
          category: "focus",
        },
        ...state.timeline,
      ].sort((left, right) => left.time.localeCompare(right.time)),
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));
