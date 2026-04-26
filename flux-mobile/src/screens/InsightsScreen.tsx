import { useMemo, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { VictoryAxis, VictoryBar, VictoryChart, VictoryLine, VictoryPie, VictoryTheme } from "victory-native";

import { DatePlanner } from "../components/calendar/DatePlanner";
import { DailySummaryRail } from "../components/canvas/DailySummaryRail";
import { InsightCard } from "../components/charts/InsightCard";
import { FluxFooter } from "../components/layout/FluxFooter";
import { FluxHeader } from "../components/layout/FluxHeader";
import { ScreenShell } from "../components/layout/ScreenShell";
import { LumeLauncher } from "../components/lume/LumeLauncher";
import { LumePanel } from "../components/lume/LumePanel";
import { pieData, trendData } from "../data/mockData";
import { RootTabParamList } from "../navigation/AppNavigator";
import { useFluxStore } from "../store/useFluxStore";
import { formatLongDate } from "../utils/date";

const barData = [
  { x: "#Trabajo", y: 82 },
  { x: "#Bienestar", y: 46 },
  { x: "#Estudio", y: 78 },
  { x: "#Social", y: 48 },
];

export function InsightsScreen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { agendaByDate, messages, selectedDate, setSelectedDate, toggleGoal, addMessage } = useFluxStore();
  const chartWidth = Math.min(430, Dimensions.get("window").width - 80);
  const selectedAgenda = agendaByDate[selectedDate] ?? { goals: [], timeline: [] };
  const datesWithItems = useMemo(
    () =>
      Object.entries(agendaByDate)
        .filter(([, agenda]) => agenda.goals.length || agenda.timeline.length)
        .map(([date]) => date),
    [agendaByDate],
  );
  const selectedDateLabel = useMemo(() => formatLongDate(selectedDate), [selectedDate]);
  const completedGoals = useMemo(
    () => selectedAgenda.goals.filter((goal) => goal.completed).length,
    [selectedAgenda.goals],
  );

  return (
    <ScreenShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
      >
        <FluxHeader activeItem="planificacion" onPressHome={() => navigation.navigate("Canvas")} onPressPlanning={() => navigation.navigate("Insights")} />

        <View className="mt-10 flex-row flex-wrap items-start gap-6">
          <DailySummaryRail
            completedGoals={completedGoals}
            goals={selectedAgenda.goals}
            onToggleGoal={toggleGoal}
            selectedDateLabel={selectedDateLabel}
            timeline={selectedAgenda.timeline}
          />

          <View className="min-w-[360px] flex-1 gap-5">
            <Text className="pl-2 text-[22px] font-semibold uppercase tracking-[1.5px] text-white">Insights & calendario</Text>

            <View className="rounded-[32px] border border-white/45 bg-white/74 p-5 shadow-sm">
              <DatePlanner datesWithItems={datesWithItems} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
            </View>

            <InsightCard title="Enfoque semanal" subtitle="Movimiento de actividad a lo largo de la semana">
              <VictoryChart width={chartWidth} height={220} padding={{ top: 18, left: 44, right: 16, bottom: 34 }} theme={VictoryTheme.material}>
                <VictoryAxis
                  style={{
                    axis: { stroke: "#D9DCE5" },
                    tickLabels: { fill: "#6F7483", fontSize: 11, padding: 8, fontFamily: "Inter_400Regular" },
                    grid: { stroke: "transparent" },
                  }}
                />
                <VictoryAxis
                  dependentAxis
                  style={{
                    axis: { stroke: "transparent" },
                    tickLabels: { fill: "#8A8F9E", fontSize: 11, padding: 8, fontFamily: "Inter_400Regular" },
                    grid: { stroke: "#ECEEF4" },
                  }}
                />
                <VictoryLine
                  animate={{ duration: 400 }}
                  data={trendData}
                  style={{ data: { stroke: "#6D4AFF", strokeWidth: 3, strokeLinecap: "round" } }}
                  x="day"
                  y="value"
                />
              </VictoryChart>
            </InsightCard>
          </View>

          <View className="min-w-[340px] flex-1 gap-5">
            <View className="rounded-[32px] border border-white/45 bg-white/74 p-5 shadow-sm">
              <View className="mb-4 flex-row items-center">
                <View className="h-12 w-12 rounded-full bg-[#E68BF7]/70" />
                <View className="absolute ml-2 h-12 w-12 rounded-full bg-[#93E4FF]/75" />
                <View className="absolute ml-4 h-12 w-12 rounded-full bg-[#A7F0C3]/65" />
                <View className="ml-16">
                  <Text className="text-[20px] font-semibold text-text">Lume</Text>
                  <Text className="text-sm text-text/60">Tu semana en resumen.</Text>
                </View>
              </View>

              <View className="flex-row flex-wrap gap-4">
                <InsightCard title="Distribución de tiempo">
                  <VictoryPie
                    animate={{ duration: 500 }}
                    colorScale={pieData.map((item) => item.color)}
                    data={pieData}
                    width={chartWidth / 1.8}
                    height={230}
                    innerRadius={52}
                    labels={() => ""}
                  />
                </InsightCard>

                <InsightCard title="Objetivos por categoría">
                  <VictoryChart width={chartWidth / 1.35} height={230} domainPadding={24} padding={{ top: 18, left: 44, right: 12, bottom: 40 }}>
                    <VictoryAxis style={{ tickLabels: { fontSize: 10, padding: 6, fill: "#6F7483" }, axis: { stroke: "#E2E5EC" } }} />
                    <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10, fill: "#8A8F9E" }, axis: { stroke: "transparent" }, grid: { stroke: "#ECEEF4" } }} />
                    <VictoryBar
                      animate={{ duration: 500 }}
                      data={barData}
                      style={{ data: { fill: "#6D4AFF", width: 22, borderRadius: 6 } }}
                    />
                  </VictoryChart>
                </InsightCard>
              </View>

              <View className="mt-4 rounded-[24px] bg-white/80 p-4">
                <Text className="text-[18px] font-semibold text-text">Productividad mensual</Text>
                {[
                  ["#Trabajo", "578", "30%"],
                  ["#Bienestar", "550", "30%"],
                  ["#Septiembre", "22%", "37%"],
                  ["Diciembre", "500", "75%"],
                ].map(([label, left, right]) => (
                  <View key={label} className="mt-3 flex-row items-center justify-between border-b border-black/5 pb-3">
                    <Text className="text-base text-text/80">{label}</Text>
                    <Text className="text-base text-text/80">{left}</Text>
                    <Text className="text-base text-text/80">{right}</Text>
                  </View>
                ))}
              </View>
            </View>
          </View>
        </View>

        <FluxFooter />
      </ScrollView>

      {panelOpen ? null : <LumeLauncher onPress={() => setPanelOpen(true)} />}

      <LumePanel
        events={selectedAgenda.timeline}
        messages={messages}
        onClose={() => setPanelOpen(false)}
        onSend={addMessage}
        visible={panelOpen}
      />
    </ScreenShell>
  );
}
