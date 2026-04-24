import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

import { GoalsCarousel } from "../components/goals/GoalsCarousel";
import { ScreenShell } from "../components/layout/ScreenShell";
import { LumePanel } from "../components/lume/LumePanel";
import { AiOrb } from "../components/orb/AiOrb";
import { TimelineLog } from "../components/timeline/TimelineLog";
import { useFluxStore } from "../store/useFluxStore";

export function DailyCanvasScreen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const { goals, timeline, messages, toggleGoal, quickLog, addMessage } = useFluxStore();

  const completedGoals = useMemo(() => goals.filter((goal) => goal.completed).length, [goals]);

  return (
    <ScreenShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[32px] bg-surface p-6">
          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-medium uppercase tracking-[1.6px] text-muted">Daily Canvas</Text>
              <Text className="mt-3 text-[32px] font-semibold leading-[38px] text-text">Hello Anuk.</Text>
              <Text className="mt-3 text-base leading-6 text-muted">
                You have {5 - completedGoals} priority blocks left today. Keep the layout calm and let Lume handle the tradeoffs.
              </Text>
            </View>

            <AiOrb />
          </View>

          <View className="mt-6 flex-row items-center justify-between rounded-[28px] bg-surfaceSoft px-4 py-4">
            <View>
              <Text className="text-sm text-muted">Focused today</Text>
              <Text className="mt-2 text-2xl font-semibold text-text">{completedGoals}/5 goals</Text>
            </View>

            <Pressable className="flex-row items-center rounded-full bg-accent px-4 py-3" onPress={() => setPanelOpen(true)}>
              <Feather color="#FFFFFF" name="cpu" size={16} />
              <Text className="ml-2 text-sm font-semibold text-white">Open Lume</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-xl font-semibold text-text">Daily Goals</Text>
          <Text className="mt-1 text-sm text-muted">Five cards max, each designed for a fast yes-or-no decision.</Text>
          <GoalsCarousel goals={goals} onToggle={toggleGoal} />
        </View>

        <TimelineLog events={timeline} onQuickLog={quickLog} />
      </ScrollView>

      <LumePanel
        events={timeline}
        messages={messages}
        onClose={() => setPanelOpen(false)}
        onSend={addMessage}
        visible={panelOpen}
      />
    </ScreenShell>
  );
}
