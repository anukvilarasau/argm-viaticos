import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View, useWindowDimensions } from "react-native";

import { Goal, TimelineEvent } from "../../types";

type DailySummaryRailProps = {
  completedGoals: number;
  goals: Goal[];
  selectedDateLabel: string;
  timeline: TimelineEvent[];
  onToggleGoal: (goalId: string) => void;
};

const toneStyle = {
  lilac: "bg-white/92",
  mint: "bg-[#DFF7E8]",
  peach: "bg-[#FFF1E6]",
  sky: "bg-[#E5F0FF]",
};

export function DailySummaryRail({
  completedGoals,
  goals,
  onToggleGoal,
  selectedDateLabel,
  timeline,
}: DailySummaryRailProps) {
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const featuredGoals = goals.slice(0, 2);
  const visibleTimeline = timeline.slice(0, 4);

  return (
    <View className={`w-full ${isMobile ? "" : "max-w-[320px]"}`} style={{ flexShrink: 1 }}>
      <Text className="text-[18px] font-medium uppercase tracking-[1.4px] text-white/90">Resumen del día</Text>
      <Text className={`mt-3 font-semibold text-white ${isMobile ? "text-[42px] leading-[44px]" : "text-[50px] leading-[52px]"}`}>¡Hola!</Text>
      <Text className={`mt-3 text-white/90 ${isMobile ? "text-[15px] leading-6" : "text-[16px] leading-7"}`}>
        Estás planificando {selectedDateLabel}. Tenés {goals.length} bloques clave y {completedGoals} ya marcados como hechos.
      </Text>

      <Text className="mt-7 text-[18px] font-semibold text-white">Enfoque del día</Text>

      <View className="mt-4 gap-3">
        {featuredGoals.length ? (
          featuredGoals.map((goal) => (
            <View key={goal.id} className={`min-h-[158px] rounded-[24px] px-4 py-4 ${toneStyle[goal.tone]}`}>
              <View className="flex-row items-start justify-between">
                <View className="flex-1 pr-3">
                  <Text className="text-[17px] font-semibold text-text">{goal.title}</Text>
                  <Text className="mt-1 text-sm text-text/60">{goal.duration}</Text>
                </View>

                <Pressable className="h-9 w-9 items-center justify-center rounded-full bg-accent" onPress={() => onToggleGoal(goal.id)}>
                  <Feather color="#FFFFFF" name={goal.completed ? "check" : "circle"} size={16} />
                </Pressable>
              </View>

              <View className="mt-5 h-2 rounded-full bg-black/10">
                <View className="h-2 rounded-full bg-accent" style={{ width: goal.completed ? "100%" : "68%" }} />
              </View>

              <View className="mt-4 gap-2">
                <Text className="text-sm text-text/80">{goal.completed ? "Objetivo completado" : "Listo para empezar"}</Text>
                <Text className="text-sm text-text/55">{goal.completed ? "Podés pasar al siguiente bloque." : "Marcá el check cuando cierres esta tarea."}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="min-h-[158px] rounded-[24px] bg-white/88 px-4 py-5">
            <Text className="text-[18px] font-semibold text-text">Todavía no hay foco cargado</Text>
            <Text className="mt-3 text-sm leading-6 text-text/60">
              Usá el panel rápido para crear tu primera actividad o un objetivo para este día.
            </Text>
          </View>
        )}
      </View>

      <Text className="mt-7 text-[18px] font-semibold text-white">Registro de actividades</Text>

      <View className="mt-4 rounded-[28px] border border-white/30 bg-white/72 p-4">
        {visibleTimeline.length ? (
          visibleTimeline.map((event, index) => (
            <View key={event.id} className="flex-row">
              <View className="mr-4 items-center">
                <View className="mt-1 h-4 w-4 rounded-full border-2 border-accent bg-[#D7F5E6]" />
                {index === visibleTimeline.length - 1 ? null : <View className="mt-1 w-[2px] flex-1 bg-accent/30" />}
              </View>

              <View className="flex-1 border-b border-black/5 pb-4 pt-1">
                <Text className="text-xs font-medium text-text/55">{event.time}</Text>
                <Text className="mt-1 text-[17px] font-semibold text-text">{event.title}</Text>
                <Text className="text-sm text-text/55">{event.tags.join("  ") || event.description}</Text>
              </View>
            </View>
          ))
        ) : (
          <View className="rounded-[20px] bg-white/90 px-4 py-6">
            <Text className="text-base font-semibold text-text">Sin actividad todavía</Text>
            <Text className="mt-2 text-sm leading-6 text-text/60">Cuando crees bloques en el calendario, el registro va a aparecer acá.</Text>
          </View>
        )}
      </View>
    </View>
  );
}
