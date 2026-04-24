export type Goal = {
  id: string;
  title: string;
  duration: string;
  completed: boolean;
  tone: "mint" | "sky" | "peach" | "lilac";
};

export type TimelineEvent = {
  id: string;
  time: string;
  title: string;
  description: string;
  tags: string[];
  category: "work" | "wellness" | "focus" | "social";
};

export type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

export type PieSlice = {
  x: string;
  y: number;
  color: string;
};

export type TrendPoint = {
  day: string;
  value: number;
};
