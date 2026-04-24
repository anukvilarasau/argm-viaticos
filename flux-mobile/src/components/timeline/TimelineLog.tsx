import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { TimelineItem } from "./TimelineItem";
import { TimelineEvent } from "../../types";

type TimelineLogProps = {
  events: TimelineEvent[];
  onQuickLog: () => void;
  onRemove: (eventId: string) => void;
};

export function TimelineLog({ events, onQuickLog, onRemove }: TimelineLogProps) {
  return (
    <View className="mt-8">
      <View className="mb-5 flex-row items-center justify-between">
        <View>
          <Text className="text-xl font-semibold text-text">Timeline Log</Text>
          <Text className="mt-1 text-sm text-muted">Fast capture in a single tap.</Text>
        </View>

        <Pressable className="flex-row items-center rounded-full bg-accent px-4 py-3" onPress={onQuickLog}>
          <Feather color="#FFFFFF" name="plus" size={16} />
          <Text className="ml-2 text-sm font-semibold text-white">Quick log</Text>
        </Pressable>
      </View>

      <View className="rounded-[28px] bg-surfaceSoft p-5">
        {events.length ? (
          events.map((event, index) => (
            <TimelineItem
              key={event.id}
              event={event}
              isLast={index === events.length - 1}
              onRemove={() => onRemove(event.id)}
            />
          ))
        ) : (
          <View className="rounded-[24px] border border-dashed border-border bg-white px-5 py-6">
            <Text className="text-base font-semibold text-text">Your timeline is empty.</Text>
            <Text className="mt-2 text-sm leading-5 text-muted">
              Add the first block below or tap quick log to drop in a lightweight placeholder and edit around it.
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}
