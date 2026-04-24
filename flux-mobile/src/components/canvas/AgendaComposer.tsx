import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { Feather } from "@expo/vector-icons";

import { TimelineEvent } from "../../types";

type AgendaComposerProps = {
  goalCount: number;
  onAddGoal: (input: { duration: string; title: string }) => void;
  onAddTimelineEvent: (input: {
    category: TimelineEvent["category"];
    description: string;
    tags: string[];
    time: string;
    title: string;
  }) => void;
};

const categories: TimelineEvent["category"][] = ["focus", "work", "wellness", "social"];

export function AgendaComposer({ goalCount, onAddGoal, onAddTimelineEvent }: AgendaComposerProps) {
  const [goalTitle, setGoalTitle] = useState("");
  const [goalDuration, setGoalDuration] = useState("");
  const [eventTime, setEventTime] = useState("");
  const [eventTitle, setEventTitle] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventTags, setEventTags] = useState("");
  const [eventCategory, setEventCategory] = useState<TimelineEvent["category"]>("focus");

  const addGoal = () => {
    const title = goalTitle.trim();
    const duration = goalDuration.trim();

    if (!title || !duration || goalCount >= 5) {
      return;
    }

    onAddGoal({ duration, title });
    setGoalTitle("");
    setGoalDuration("");
  };

  const addEvent = () => {
    const time = eventTime.trim();
    const title = eventTitle.trim();
    const description = eventDescription.trim();

    if (!time || !title || !description) {
      return;
    }

    onAddTimelineEvent({
      category: eventCategory,
      description,
      tags: eventTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean)
        .map((tag) => (tag.startsWith("#") ? tag : `#${tag}`)),
      time,
      title,
    });

    setEventTime("");
    setEventTitle("");
    setEventDescription("");
    setEventTags("");
    setEventCategory("focus");
  };

  return (
    <View className="mt-8 gap-4">
      <View className="rounded-[32px] bg-surface px-5 py-5">
        <View className="mb-4 flex-row items-center justify-between">
          <View>
            <Text className="text-xl font-semibold text-text">Build your day</Text>
            <Text className="mt-1 text-sm text-muted">Nothing is preloaded now. You define the agenda from here.</Text>
          </View>
          <View className="rounded-full bg-accentSoft px-3 py-2">
            <Text className="text-xs font-semibold uppercase tracking-[1px] text-accent">{goalCount}/5 goals</Text>
          </View>
        </View>

        <View className="rounded-[28px] bg-[#F4F5FA] p-4">
          <Text className="text-sm font-semibold text-text">Add goal</Text>
          <View className="mt-3 gap-3">
            <TextInput
              className="rounded-[20px] bg-white px-4 py-4 text-base text-text"
              onChangeText={setGoalTitle}
              placeholder="Goal title"
              placeholderTextColor="#8A8F9E"
              value={goalTitle}
            />
            <View className="flex-row gap-3">
              <TextInput
                className="flex-1 rounded-[20px] bg-white px-4 py-4 text-base text-text"
                onChangeText={setGoalDuration}
                placeholder="Duration, e.g. 45 min"
                placeholderTextColor="#8A8F9E"
                value={goalDuration}
              />
              <Pressable
                className={`items-center justify-center rounded-[20px] px-5 ${
                  goalCount >= 5 ? "bg-border" : "bg-accent"
                }`}
                onPress={addGoal}
              >
                <Feather color="#FFFFFF" name="plus" size={18} />
              </Pressable>
            </View>
          </View>
        </View>
      </View>

      <View className="rounded-[32px] bg-[#14151C] px-5 py-5">
        <View className="mb-4">
          <Text className="text-xl font-semibold text-white">Drop a timeline block</Text>
          <Text className="mt-1 text-sm text-white/65">Quick enough to feel light, structured enough to actually plan.</Text>
        </View>

        <View className="gap-3">
          <View className="flex-row gap-3">
            <TextInput
              className="w-28 rounded-[20px] bg-white/10 px-4 py-4 text-base text-white"
              onChangeText={setEventTime}
              placeholder="09:30"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={eventTime}
            />
            <TextInput
              className="flex-1 rounded-[20px] bg-white/10 px-4 py-4 text-base text-white"
              onChangeText={setEventTitle}
              placeholder="Event title"
              placeholderTextColor="rgba(255,255,255,0.45)"
              value={eventTitle}
            />
          </View>

          <TextInput
            className="rounded-[20px] bg-white/10 px-4 py-4 text-base text-white"
            onChangeText={setEventDescription}
            placeholder="Short description"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={eventDescription}
          />

          <TextInput
            className="rounded-[20px] bg-white/10 px-4 py-4 text-base text-white"
            onChangeText={setEventTags}
            placeholder="Tags, separated by commas"
            placeholderTextColor="rgba(255,255,255,0.45)"
            value={eventTags}
          />

          <View className="flex-row flex-wrap gap-2">
            {categories.map((category) => {
              const active = category === eventCategory;
              return (
                <Pressable
                  key={category}
                  className={`rounded-full px-4 py-2 ${active ? "bg-white" : "bg-white/10"}`}
                  onPress={() => setEventCategory(category)}
                >
                  <Text className={`text-sm font-medium capitalize ${active ? "text-text" : "text-white"}`}>{category}</Text>
                </Pressable>
              );
            })}
          </View>

          <Pressable className="mt-1 flex-row items-center justify-center rounded-[22px] bg-accent px-5 py-4" onPress={addEvent}>
            <Feather color="#FFFFFF" name="corner-down-right" size={18} />
            <Text className="ml-2 text-sm font-semibold text-white">Add to timeline</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
