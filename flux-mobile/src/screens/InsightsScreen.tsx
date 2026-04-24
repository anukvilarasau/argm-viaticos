import { useMemo } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { VictoryAxis, VictoryChart, VictoryLine, VictoryPie, VictoryTheme } from "victory-native";

import { InsightCard } from "../components/charts/InsightCard";
import { ScreenShell } from "../components/layout/ScreenShell";
import { pieData, trendData } from "../data/mockData";
import { useFluxStore } from "../store/useFluxStore";

export function InsightsScreen() {
  const { goals, timeline } = useFluxStore();
  const chartWidth = Dimensions.get("window").width - 88;

  const summary = useMemo(() => {
    const completed = goals.filter((goal) => goal.completed).length;
    const logCount = timeline.length;

    return {
      completed,
      logCount,
      consistency: Math.min(96, 52 + completed * 8 + logCount * 2),
    };
  }, [goals, timeline]);

  return (
    <ScreenShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 140, gap: 18 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="rounded-[32px] bg-surface p-6">
          <Text className="text-sm font-medium uppercase tracking-[1.6px] text-muted">Insights Dashboard</Text>
          <Text className="mt-3 text-[32px] font-semibold leading-[38px] text-text">Progress at a glance.</Text>
          <Text className="mt-3 text-base leading-6 text-muted">
            Clean signals, no clutter. These charts turn your day into a calm decision surface.
          </Text>
        </View>

        <View className="flex-row gap-4">
          <View className="flex-1 rounded-[28px] bg-accent px-5 py-5">
            <Text className="text-sm text-white/80">Consistency</Text>
            <Text className="mt-2 text-3xl font-semibold text-white">{summary.consistency}%</Text>
          </View>
          <View className="flex-1 rounded-[28px] bg-surface px-5 py-5">
            <Text className="text-sm text-muted">Entries today</Text>
            <Text className="mt-2 text-3xl font-semibold text-text">{summary.logCount}</Text>
          </View>
        </View>

        <InsightCard title="Time Distribution" subtitle="How today is currently split">
          <View className="items-center">
            <VictoryPie
              animate={{ duration: 500 }}
              colorScale={pieData.map((item) => item.color)}
              data={pieData}
              width={chartWidth}
              height={240}
              innerRadius={60}
              padAngle={2}
              labels={({ datum }) => `${datum.x}\n${datum.y}%`}
              style={{
                labels: {
                  fill: "#17181C",
                  fontFamily: "Inter_500Medium",
                  fontSize: 11,
                },
              }}
            />
          </View>
        </InsightCard>

        <InsightCard title="Daily Activity Trend" subtitle="Weekly movement, kept intentionally simple">
          <VictoryChart width={chartWidth} height={240} padding={{ top: 20, left: 44, right: 24, bottom: 36 }} theme={VictoryTheme.material}>
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
              animate={{ duration: 500 }}
              data={trendData}
              style={{
                data: { stroke: "#6D4AFF", strokeWidth: 3, strokeLinecap: "round" },
              }}
              x="day"
              y="value"
            />
          </VictoryChart>
        </InsightCard>

        <InsightCard title="Completion Snapshot">
          <View className="flex-row justify-between rounded-[24px] bg-surfaceSoft p-4">
            <View>
              <Text className="text-sm text-muted">Goals done</Text>
              <Text className="mt-2 text-2xl font-semibold text-text">{summary.completed}</Text>
            </View>
            <View>
              <Text className="text-sm text-muted">Best signal</Text>
              <Text className="mt-2 text-lg font-semibold text-text">Morning energy</Text>
            </View>
          </View>
        </InsightCard>
      </ScrollView>
    </ScreenShell>
  );
}
