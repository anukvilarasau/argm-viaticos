import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { TimelineEvent } from "../../types";

type TimelineItemProps = {
  event: TimelineEvent;
  isLast: boolean;
  onRemove: () => void;
};

function TimelineItemComponent({ event, isLast, onRemove }: TimelineItemProps) {
  return (
    <View className="flex-row">
      <View className="mr-4 items-center">
        <View className="mt-1 h-4 w-4 rounded-full border-2 border-accent bg-background" />
        {!isLast ? <View className="mt-1 w-[2px] flex-1 bg-border" /> : null}
      </View>

      <View className="flex-1 pb-6">
        <Text className="text-xs font-medium uppercase tracking-[1px] text-muted">{event.time}</Text>
        <View className="mt-2 rounded-card bg-surface p-4">
          <View className="flex-row items-start justify-between">
            <Text className="flex-1 pr-3 text-base font-semibold text-text">{event.title}</Text>
            <Pressable className="h-8 w-8 items-center justify-center rounded-full bg-surfaceSoft" onPress={onRemove}>
              <Feather color="#6F7483" name="trash-2" size={14} />
            </Pressable>
          </View>
          <Text className="mt-1 text-sm leading-5 text-muted">{event.description}</Text>
          <Text className="mt-3 text-xs font-medium text-accent">{event.tags.join("  ")}</Text>
        </View>
      </View>
    </View>
  );
}

export const TimelineItem = memo(TimelineItemComponent);
