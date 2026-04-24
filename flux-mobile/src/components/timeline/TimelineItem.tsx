import { memo } from "react";
import { Text, View } from "react-native";

import { TimelineEvent } from "../../types";

type TimelineItemProps = {
  event: TimelineEvent;
  isLast: boolean;
};

function TimelineItemComponent({ event, isLast }: TimelineItemProps) {
  return (
    <View className="flex-row">
      <View className="mr-4 items-center">
        <View className="mt-1 h-4 w-4 rounded-full border-2 border-accent bg-background" />
        {!isLast ? <View className="mt-1 w-[2px] flex-1 bg-border" /> : null}
      </View>

      <View className="flex-1 pb-6">
        <Text className="text-xs font-medium uppercase tracking-[1px] text-muted">{event.time}</Text>
        <View className="mt-2 rounded-card bg-surface p-4">
          <Text className="text-base font-semibold text-text">{event.title}</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">{event.description}</Text>
          <Text className="mt-3 text-xs font-medium text-accent">{event.tags.join("  ")}</Text>
        </View>
      </View>
    </View>
  );
}

export const TimelineItem = memo(TimelineItemComponent);
