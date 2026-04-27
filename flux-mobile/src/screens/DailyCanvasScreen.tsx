import { useMemo, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { DailySummaryRail } from "../components/canvas/DailySummaryRail";
import { QuickAddSidebar } from "../components/canvas/QuickAddSidebar";
import { WeeklyPlannerBoard } from "../components/canvas/WeeklyPlannerBoard";
import { FluxFooter } from "../components/layout/FluxFooter";
import { FluxHeader } from "../components/layout/FluxHeader";
import { ScreenShell } from "../components/layout/ScreenShell";
import { LumeLauncher } from "../components/lume/LumeLauncher";
import { LumePanel } from "../components/lume/LumePanel";
import { RootTabParamList } from "../navigation/AppNavigator";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar";
import { useFluxStore } from "../store/useFluxStore";
import { formatLongDate, getWeekDates } from "../utils/date";

export function DailyCanvasScreen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const {
    agendaByDate,
    messages,
    selectedDate,
    setSelectedDate,
    toggleGoal,
    addMessage,
    addGoal,
    addTimelineEvent,
    importTimelineEvents,
  } = useFluxStore();
  const { connect, disconnect, email, exportDate, importDate, isConfigured, isConnected, status } = useGoogleCalendar();

  const selectedAgenda = agendaByDate[selectedDate] ?? { goals: [], timeline: [] };
  const selectedDateLabel = useMemo(() => formatLongDate(selectedDate), [selectedDate]);
  const completedGoals = useMemo(
    () => selectedAgenda.goals.filter((goal) => goal.completed).length,
    [selectedAgenda.goals],
  );
  const weekDates = useMemo(() => getWeekDates(selectedDate), [selectedDate]);

  const handleImportGoogleEvents = async () => {
    const importedEvents = await importDate(selectedDate);
    importTimelineEvents(selectedDate, importedEvents);
  };

  const handleExportGoogleEvents = async () => {
    await exportDate(selectedDate, selectedAgenda.timeline);
  };

  return (
    <ScreenShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 18, paddingBottom: 170 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <FluxHeader activeItem="planificacion" onPressHome={() => navigation.navigate("Canvas")} onPressPlanning={() => navigation.navigate("Insights")} />

        <View className="mt-10 flex-row flex-wrap items-start gap-5">
          <DailySummaryRail
            completedGoals={completedGoals}
            goals={selectedAgenda.goals}
            onToggleGoal={toggleGoal}
            selectedDateLabel={selectedDateLabel}
            timeline={selectedAgenda.timeline}
          />

          <View className="min-w-[0px] flex-1 gap-4" style={{ flexGrow: 1.35, flexShrink: 1, flexBasis: 480 }}>
            <Text className="pl-2 text-[22px] font-semibold uppercase tracking-[1.5px] text-white">Planificación semanal</Text>
            <WeeklyPlannerBoard
              agendaByDate={agendaByDate}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
              weekDates={weekDates}
            />
          </View>

          <QuickAddSidebar
            canExport={isConnected && selectedAgenda.timeline.length > 0}
            canImport={isConnected}
            email={email}
            goalCount={selectedAgenda.goals.length}
            isConfigured={isConfigured}
            isConnected={isConnected}
            onAddGoal={addGoal}
            onConnectGoogle={connect}
            onCreateActivity={addTimelineEvent}
            onDisconnectGoogle={disconnect}
            onExportGoogle={handleExportGoogleEvents}
            onImportGoogle={handleImportGoogleEvents}
            selectedDateLabel={selectedDateLabel}
            status={status}
          />
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
