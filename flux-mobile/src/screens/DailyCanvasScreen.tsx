import { useMemo, useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { PlanningControlPanel } from "../components/canvas/PlanningControlPanel";
import { WeeklyPlannerBoard } from "../components/canvas/WeeklyPlannerBoard";
import { FluxFooter } from "../components/layout/FluxFooter";
import { FluxHeader } from "../components/layout/FluxHeader";
import { ScreenShell } from "../components/layout/ScreenShell";
import { LumeLauncher } from "../components/lume/LumeLauncher";
import { LumePanel } from "../components/lume/LumePanel";
import { MobileNavMenu } from "../components/navigation/MobileNavMenu";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { RootTabParamList } from "../navigation/AppNavigator";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar";
import { useFluxStore } from "../store/useFluxStore";
import { formatLongDate, getWeekDates } from "../utils/date";

export function DailyCanvasScreen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const {
    agendaByDate,
    messages,
    selectedDate,
    setSelectedDate,
    addMessage,
    addGoal,
    addTimelineEvent,
    importTimelineEvents,
  } = useFluxStore();
  const { connect, disconnect, email, exportDate, importDate, isConfigured, isConnected, status } = useGoogleCalendar();

  const selectedAgenda = agendaByDate[selectedDate] ?? { goals: [], timeline: [] };
  const selectedDateLabel = useMemo(() => formatLongDate(selectedDate), [selectedDate]);
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
        contentContainerStyle={{ paddingHorizontal: isMobile ? 16 : 22, paddingTop: 18, paddingBottom: 170 }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {isMobile ? (
          <MobileTopBar onOpenMenu={() => setMenuOpen(true)} title="Planificación" />
        ) : (
          <FluxHeader activeItem="planificacion" onPressHome={() => navigation.navigate("Canvas")} onPressPlanning={() => navigation.navigate("Insights")} />
        )}

        <View className={`mt-10 ${isMobile ? "gap-5" : "flex-row flex-wrap items-start gap-5"}`}>
          <PlanningControlPanel
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

          <View className="min-w-[0px] flex-1 gap-4" style={isMobile ? undefined : { flexGrow: 1.35, flexShrink: 1, flexBasis: 480 }}>
            <Text className="pl-2 text-[22px] font-semibold uppercase tracking-[1.5px] text-white">Planificación semanal</Text>
            <WeeklyPlannerBoard
              agendaByDate={agendaByDate}
              onSelectDate={setSelectedDate}
              selectedDate={selectedDate}
              weekDates={weekDates}
            />
          </View>

        </View>

        {isMobile ? null : <FluxFooter />}
      </ScrollView>

      {panelOpen ? null : <LumeLauncher onPress={() => setPanelOpen(true)} />}

      <LumePanel
        events={selectedAgenda.timeline}
        messages={messages}
        onClose={() => setPanelOpen(false)}
        onSend={addMessage}
        visible={panelOpen}
      />

      {isMobile ? (
        <MobileNavMenu
          onClose={() => setMenuOpen(false)}
          onOpenCalendar={() => {
            setMenuOpen(false);
            navigation.navigate("Calendar");
          }}
          onOpenHome={() => {
            setMenuOpen(false);
            navigation.navigate("Canvas");
          }}
          onOpenLume={() => {
            setMenuOpen(false);
            setPanelOpen(true);
          }}
          onOpenPlanning={() => {
            setMenuOpen(false);
            navigation.navigate("Insights");
          }}
          visible={menuOpen}
        />
      ) : null}
    </ScreenShell>
  );
}
