import { create } from "zustand";

import { initialGoals, initialMessages, initialTimeline } from "../data/mockData";
import { ChatMessage, Goal, TimelineEvent } from "../types";

type FluxState = {
  goals: Goal[];
  timeline: TimelineEvent[];
  messages: ChatMessage[];
  toggleGoal: (goalId: string) => void;
  quickLog: () => void;
  addMessage: (message: ChatMessage) => void;
};

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
  quickLog: () =>
    set((state) => ({
      timeline: [
        {
          id: `event-${Date.now()}`,
          time: currentTimeLabel(),
          title: "Quick capture",
          description: "Logged in one tap to keep momentum flowing.",
          tags: ["#quicklog", "#captured"],
          category: "focus",
        },
        ...state.timeline,
      ],
    })),
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
}));
