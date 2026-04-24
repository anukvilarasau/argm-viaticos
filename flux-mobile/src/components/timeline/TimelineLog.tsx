import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { TimelineItem } from "./TimelineItem";
import { TimelineEvent } from "../../types";

type TimelineLogProps = {
  events: TimelineEvent[];
  onQuickLog: () => void;
};

export function TimelineLog({ events, onQuickLog }: TimelineLogProps) {
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
        {events.map((event, index) => (
          <TimelineItem key={event.id} event={event} isLast={index === events.length - 1} />
        ))}
      </View>
    </View>
  );
}
