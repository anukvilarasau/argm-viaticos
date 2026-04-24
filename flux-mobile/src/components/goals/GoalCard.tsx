import { memo, useEffect } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useRef } from "react";

import { Goal } from "../../types";

const toneStyles = {
  mint: "bg-mint",
  sky: "bg-sky",
  peach: "bg-peach",
  lilac: "bg-accentSoft",
};

type GoalCardProps = {
  goal: Goal;
  onToggle: () => void;
};

function GoalCardComponent({ goal, onToggle }: GoalCardProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.spring(scale, { toValue: 1.03, useNativeDriver: true }),
      Animated.spring(scale, { toValue: 1, useNativeDriver: true }),
    ]).start();
  }, [goal.completed, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }} className={`mr-4 w-48 rounded-card ${toneStyles[goal.tone]} p-4`}>
      <View className="mb-10 flex-row items-start justify-between">
        <View className="flex-1 pr-3">
          <Text className="text-base font-semibold text-text">{goal.title}</Text>
          <Text className="mt-2 text-sm text-muted">{goal.duration}</Text>
        </View>

        <Pressable
          accessibilityRole="button"
          className={`h-9 w-9 items-center justify-center rounded-full ${goal.completed ? "bg-text" : "bg-white/80"}`}
          onPress={onToggle}
        >
          <Feather color={goal.completed ? "#FFFFFF" : "#6F7483"} name={goal.completed ? "check" : "circle"} size={16} />
        </Pressable>
      </View>

      <View className="self-start rounded-full bg-white/75 px-3 py-2">
        <Text className="text-xs font-medium uppercase tracking-[1px] text-text">
          {goal.completed ? "Completed" : "In focus"}
        </Text>
      </View>
    </Animated.View>
  );
}

export const GoalCard = memo(GoalCardComponent);
