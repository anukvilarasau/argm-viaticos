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
import { RootTabParamList } from "../navigation/AppNavigator";
import { useFluxStore } from "../store/useFluxStore";
import { formatLongDate, formatWeekdayShort, getWeekDates } from "../utils/date";

const categoryMeta = {
  work: { color: "#6D4AFF", label: "Trabajo" },
  wellness: { color: "#B7E8D2", label: "Bienestar" },
  focus: { color: "#CFC3FF", label: "Enfoque" },
  social: { color: "#DCEEFF", label: "Social" },
} as const;

function EmptyInsight({ message }: { message: string }) {
  return (
    <View className="items-center rounded-[24px] bg-surfaceSoft px-5 py-10">
      <Text className="text-center text-sm leading-6 text-muted">{message}</Text>
    </View>
  );
}

export function InsightsScreen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { agendaByDate, messages, selectedDate, setSelectedDate, toggleGoal, addMessage } = useFluxStore();
  const chartWidth = Math.min(430, Dimensions.get("window").width - 80);
  const sideCardChartWidth = Math.min(360, Dimensions.get("window").width - 120);
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
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const pieChartData = useMemo(() => {
    const counts = {
      work: 0,
      wellness: 0,
      focus: 0,
      social: 0,
    };

    selectedAgenda.timeline.forEach((event) => {
      counts[event.category] += 1;
    });

    return Object.entries(counts)
      .filter(([, value]) => value > 0)
      .map(([key, value]) => ({
        x: categoryMeta[key as keyof typeof categoryMeta].label,
        y: value,
        color: categoryMeta[key as keyof typeof categoryMeta].color,
      }));
  }, [selectedAgenda.timeline]);

  const barChartData = useMemo(() => {
    const counts = {
      work: 0,
      wellness: 0,
      focus: 0,
      social: 0,
    };

    selectedAgenda.goals.forEach((goal, index) => {
      const mappedCategory = (["focus", "work", "wellness", "social"][index % 4] ?? "focus") as keyof typeof counts;
      counts[mappedCategory] += 1;
    });

    selectedAgenda.timeline.forEach((event) => {
      counts[event.category] += 1;
    });

    return Object.entries(counts).map(([key, value]) => ({
      x: categoryMeta[key as keyof typeof categoryMeta].label,
      y: value,
    }));
  }, [selectedAgenda.goals, selectedAgenda.timeline]);

  const trendData = useMemo(
    () =>
      weekDates.map((date) => {
        const agenda = agendaByDate[date] ?? { goals: [], timeline: [] };
        const completed = agenda.goals.filter((goal) => goal.completed).length;

        return {
          day: formatWeekdayShort(date),
          value: agenda.timeline.length + completed,
        };
      }),
    [agendaByDate, weekDates],
  );

  const monthlyRows = useMemo(() => {
    const monthMap = new Map<string, { activities: number; goals: number }>();

    Object.entries(agendaByDate).forEach(([date, agenda]) => {
      const key = date.slice(0, 7);
      const current = monthMap.get(key) ?? { activities: 0, goals: 0 };
      current.activities += agenda.timeline.length;
      current.goals += agenda.goals.length;
      monthMap.set(key, current);
    });

    return [...monthMap.entries()]
      .sort(([left], [right]) => left.localeCompare(right))
      .slice(-4)
      .map(([month, stats]) => ({
        label: month,
        activities: stats.activities,
        goals: stats.goals,
      }));
  }, [agendaByDate]);

  const hasTrendData = trendData.some((item) => item.value > 0);
  const hasCategoryData = barChartData.some((item) => item.y > 0);

  return (
    <ScreenShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
      >
        <FluxHeader activeItem="inicio" onPressHome={() => navigation.navigate("Canvas")} onPressPlanning={() => navigation.navigate("Insights")} />

        <View className="mt-10 flex-row flex-wrap items-start gap-5">
          <DailySummaryRail
            completedGoals={completedGoals}
            goals={selectedAgenda.goals}
            onToggleGoal={toggleGoal}
            selectedDateLabel={selectedDateLabel}
            timeline={selectedAgenda.timeline}
          />

          <View className="min-w-[0px] flex-1 gap-4" style={{ flexGrow: 1.05, flexShrink: 1, flexBasis: 350 }}>
            <Text className="pl-2 text-[22px] font-semibold uppercase tracking-[1.5px] text-white">Inicio</Text>

            <View className="rounded-[32px] border border-white/45 bg-white/74 p-5 shadow-sm">
              <DatePlanner datesWithItems={datesWithItems} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
            </View>

            <InsightCard title="Enfoque semanal" subtitle="Movimiento de actividad a lo largo de la semana">
              {hasTrendData ? (
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
              ) : (
                <EmptyInsight message="Todavía no hay suficientes actividades para mostrar una tendencia semanal." />
              )}
            </InsightCard>
          </View>

          <View className="min-w-[0px] flex-1 gap-4" style={{ flexGrow: 1.1, flexShrink: 1, flexBasis: 360 }}>
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

              <View className="gap-4">
                <InsightCard title="Distribución de tiempo">
                  {pieChartData.length ? (
                    <VictoryPie
                      animate={{ duration: 500 }}
                      colorScale={pieChartData.map((item) => item.color)}
                      data={pieChartData}
                      width={sideCardChartWidth}
                      height={230}
                      innerRadius={52}
                      labels={() => ""}
                    />
                  ) : (
                    <EmptyInsight message="Tu distribución de tiempo va a aparecer acá cuando cargues actividades por categoría." />
                  )}
                </InsightCard>

                <InsightCard title="Objetivos por categoría">
                  {hasCategoryData ? (
                    <VictoryChart width={sideCardChartWidth} height={230} domainPadding={24} padding={{ top: 18, left: 44, right: 18, bottom: 40 }}>
                      <VictoryAxis style={{ tickLabels: { fontSize: 10, padding: 6, fill: "#6F7483" }, axis: { stroke: "#E2E5EC" } }} />
                      <VictoryAxis dependentAxis style={{ tickLabels: { fontSize: 10, fill: "#8A8F9E" }, axis: { stroke: "transparent" }, grid: { stroke: "#ECEEF4" } }} />
                      <VictoryBar
                        animate={{ duration: 500 }}
                        data={barChartData}
                        style={{ data: { fill: "#6D4AFF", width: 22, borderRadius: 6 } }}
                      />
                    </VictoryChart>
                  ) : (
                    <EmptyInsight message="Todavía no hay objetivos o actividades suficientes para llenar este gráfico." />
                  )}
                </InsightCard>
              </View>

              <View className="mt-4 rounded-[24px] bg-white/80 p-4">
                <Text className="text-[18px] font-semibold text-text">Productividad mensual</Text>
                {monthlyRows.length ? (
                  monthlyRows.map((row) => (
                    <View key={row.label} className="mt-3 flex-row items-center justify-between border-b border-black/5 pb-3">
                      <Text className="text-base text-text/80">{row.label}</Text>
                      <Text className="text-base text-text/80">{row.activities} actividades</Text>
                      <Text className="text-base text-text/80">{row.goals} objetivos</Text>
                    </View>
                  ))
                ) : (
                  <Text className="mt-3 text-sm leading-6 text-muted">
                    Cuando empieces a cargar tu agenda, este resumen mensual se va a completar automáticamente.
                  </Text>
                )}
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
