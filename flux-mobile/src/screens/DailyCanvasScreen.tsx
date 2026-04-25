import { Feather } from "@expo/vector-icons";
import { useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { useNavigation } from "@react-navigation/native";

import { DatePlanner } from "../components/calendar/DatePlanner";
import { GoogleCalendarCard } from "../components/calendar/GoogleCalendarCard";
import { AgendaComposer } from "../components/canvas/AgendaComposer";
import { GoalsCarousel } from "../components/goals/GoalsCarousel";
import { ScreenShell } from "../components/layout/ScreenShell";
import { LumePanel } from "../components/lume/LumePanel";
import { HamburgerMenu } from "../components/navigation/HamburgerMenu";
import { AiOrb } from "../components/orb/AiOrb";
import { TimelineLog } from "../components/timeline/TimelineLog";
import { useGoogleCalendar } from "../hooks/useGoogleCalendar";
import { useFluxStore } from "../store/useFluxStore";
import { RootTabParamList } from "../navigation/AppNavigator";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import { formatLongDate } from "../utils/date";

export function DailyCanvasScreen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const {
    agendaByDate,
    messages,
    selectedDate,
    setSelectedDate,
    toggleGoal,
    quickLog,
    addMessage,
    addGoal,
    removeGoal,
    addTimelineEvent,
    removeTimelineEvent,
    importTimelineEvents,
  } = useFluxStore();
  const { connect, disconnect, email, exportDate, importDate, isConfigured, isConnected, status } = useGoogleCalendar();

  const selectedAgenda = agendaByDate[selectedDate] ?? { goals: [], timeline: [] };
  const goals = selectedAgenda.goals;
  const timeline = selectedAgenda.timeline;
  const datesWithItems = useMemo(
    () =>
      Object.entries(agendaByDate)
        .filter(([, agenda]) => agenda.goals.length || agenda.timeline.length)
        .map(([date]) => date),
    [agendaByDate],
  );
  const selectedDateLabel = useMemo(() => formatLongDate(selectedDate), [selectedDate]);

  const completedGoals = useMemo(() => goals.filter((goal) => goal.completed).length, [goals]);

  const handleImportGoogleEvents = async () => {
    try {
      const importedEvents = await importDate(selectedDate);
      importTimelineEvents(selectedDate, importedEvents);
      setSyncMessage(`Imported ${importedEvents.length} Google events for ${selectedDateLabel}.`);
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Unable to import Google events.");
    }
  };

  const handleExportGoogleEvents = async () => {
    try {
      await exportDate(selectedDate, timeline);
      setSyncMessage(`Exported ${timeline.length} Flux events to Google Calendar for ${selectedDateLabel}.`);
    } catch (error) {
      setSyncMessage(error instanceof Error ? error.message : "Unable to export Google events.");
    }
  };

  return (
    <ScreenShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 10, paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="overflow-hidden rounded-[36px] bg-surface p-6">
          <View className="absolute left-0 top-0 h-32 w-32 rounded-full bg-accent/10" />
          <View className="absolute right-[-20px] top-10 h-44 w-44 rounded-full bg-[#DFF8EF]" />

          <View className="mb-6 flex-row items-center justify-between">
            <Pressable className="h-12 w-12 items-center justify-center rounded-full bg-surfaceSoft" onPress={() => setMenuOpen(true)}>
              <Feather color="#17181C" name="menu" size={20} />
            </Pressable>

            <View className="rounded-full bg-[#F2EEFF] px-4 py-2">
              <Text className="text-xs font-semibold uppercase tracking-[1.3px] text-accent">Canvas editor</Text>
            </View>
          </View>

          <View className="flex-row items-start justify-between">
            <View className="flex-1 pr-4">
              <Text className="text-sm font-medium uppercase tracking-[1.6px] text-muted">Daily Canvas</Text>
              <Text className="mt-3 text-[34px] font-semibold leading-[40px] text-text">Set the day yourself.</Text>
              <Text className="mt-3 text-base leading-6 text-muted">
                Planning for {selectedDateLabel}. Flux no longer assumes your plan. Add only what matters, then let the interface stay out of the way.
              </Text>
            </View>

            <AiOrb />
          </View>

          <View className="mt-6 flex-row gap-3">
            <View className="flex-1 rounded-[28px] bg-[#13141A] px-4 py-4">
              <Text className="text-sm text-white/65">Goals completed</Text>
              <Text className="mt-2 text-3xl font-semibold text-white">{completedGoals}/5</Text>
            </View>
            <View className="flex-1 rounded-[28px] bg-surfaceSoft px-4 py-4">
              <Text className="text-sm text-muted">Timeline blocks</Text>
              <Text className="mt-2 text-3xl font-semibold text-text">{timeline.length}</Text>
            </View>
          </View>

          <View className="mt-4 flex-row items-center justify-between rounded-[28px] bg-[#F6F1FF] px-4 py-4">
            <View className="flex-1 pr-3">
              <Text className="text-sm font-medium text-text">Need help after planning?</Text>
              <Text className="mt-1 text-sm leading-5 text-muted">Open Lume once your own agenda is loaded and it will suggest adjustments.</Text>
            </View>

            <Pressable className="flex-row items-center rounded-full bg-accent px-4 py-3" onPress={() => setPanelOpen(true)}>
              <Feather color="#FFFFFF" name="cpu" size={16} />
              <Text className="ml-2 text-sm font-semibold text-white">Open Lume</Text>
            </Pressable>
          </View>
        </View>

        <View className="mt-8">
          <Text className="text-xl font-semibold text-text">Daily Goals</Text>
          <Text className="mt-1 text-sm text-muted">Five cards max, created by you and removable whenever the day changes.</Text>
          {goals.length ? null : (
            <View className="mt-5 rounded-[28px] border border-dashed border-border bg-surface px-5 py-6">
              <Text className="text-base font-semibold text-text">No goals yet.</Text>
              <Text className="mt-2 text-sm leading-5 text-muted">
                Use the planner below to create your first block. The carousel will appear here as soon as you add one.
              </Text>
            </View>
          )}
          <GoalsCarousel goals={goals} onRemove={removeGoal} onToggle={toggleGoal} />
        </View>

        <DatePlanner datesWithItems={datesWithItems} onSelectDate={setSelectedDate} selectedDate={selectedDate} />

        <GoogleCalendarCard
          canExport={isConnected && timeline.length > 0}
          canImport={isConnected}
          email={email}
          isConfigured={isConfigured}
          isConnected={isConnected}
          onConnect={connect}
          onDisconnect={disconnect}
          onExport={handleExportGoogleEvents}
          onImport={handleImportGoogleEvents}
          selectedDateLabel={selectedDateLabel}
          status={status}
        />

        {syncMessage ? (
          <View className="mt-4 rounded-[24px] bg-[#F2EEFF] px-5 py-4">
            <Text className="text-sm font-medium text-text">{syncMessage}</Text>
          </View>
        ) : null}

        <AgendaComposer
          goalCount={goals.length}
          onAddGoal={addGoal}
          onAddTimelineEvent={addTimelineEvent}
          selectedDateLabel={selectedDateLabel}
        />

        <TimelineLog events={timeline} onQuickLog={quickLog} onRemove={removeTimelineEvent} />
      </ScrollView>

      <HamburgerMenu
        completedGoals={completedGoals}
        onClose={() => setMenuOpen(false)}
        onOpenInsights={() => {
          setMenuOpen(false);
          navigation.navigate("Insights");
        }}
        onOpenLume={() => {
          setMenuOpen(false);
          setPanelOpen(true);
        }}
        timelineCount={timeline.length}
        visible={menuOpen}
      />

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
