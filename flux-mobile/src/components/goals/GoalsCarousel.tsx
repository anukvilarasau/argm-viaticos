import { ScrollView, View } from "react-native";

import { GoalCard } from "./GoalCard";
import { Goal } from "../../types";

type GoalsCarouselProps = {
  goals: Goal[];
  onToggle: (goalId: string) => void;
};

export function GoalsCarousel({ goals, onToggle }: GoalsCarouselProps) {
  return (
    <View>
      <ScrollView
        className="mt-5"
        contentContainerStyle={{ paddingRight: 24 }}
        horizontal
        showsHorizontalScrollIndicator={false}
      >
        {goals.slice(0, 5).map((goal) => (
          <GoalCard key={goal.id} goal={goal} onToggle={() => onToggle(goal.id)} />
        ))}
      </ScrollView>
    </View>
  );
}
