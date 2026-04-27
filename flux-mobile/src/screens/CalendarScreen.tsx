import { useMemo, useState } from "react";
import { ScrollView, Text, View, useWindowDimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";

import { DatePlanner } from "../components/calendar/DatePlanner";
import { FluxFooter } from "../components/layout/FluxFooter";
import { ScreenShell } from "../components/layout/ScreenShell";
import { LumeLauncher } from "../components/lume/LumeLauncher";
import { LumePanel } from "../components/lume/LumePanel";
import { MobileNavMenu } from "../components/navigation/MobileNavMenu";
import { MobileTopBar } from "../components/navigation/MobileTopBar";
import { RootTabParamList } from "../navigation/AppNavigator";
import { useFluxStore } from "../store/useFluxStore";
import { formatLongDate } from "../utils/date";

export function CalendarScreen() {
  const [panelOpen, setPanelOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const navigation = useNavigation<BottomTabNavigationProp<RootTabParamList>>();
  const { agendaByDate, messages, selectedDate, setSelectedDate, addMessage } = useFluxStore();
  const selectedAgenda = agendaByDate[selectedDate] ?? { goals: [], timeline: [] };
  const datesWithItems = useMemo(
    () =>
      Object.entries(agendaByDate)
        .filter(([, agenda]) => agenda.goals.length || agenda.timeline.length)
        .map(([date]) => date),
    [agendaByDate],
  );
  const selectedDateLabel = useMemo(() => formatLongDate(selectedDate), [selectedDate]);

  return (
    <ScreenShell>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingHorizontal: isMobile ? 16 : 22, paddingTop: 18, paddingBottom: 170 }}
        showsVerticalScrollIndicator={false}
      >
        {isMobile ? <MobileTopBar onOpenMenu={() => setMenuOpen(true)} title="Calendario" /> : null}

        <View className="rounded-[32px] border border-white/45 bg-white/74 p-4 shadow-sm">
          <DatePlanner datesWithItems={datesWithItems} onSelectDate={setSelectedDate} selectedDate={selectedDate} />
        </View>

        <View className="mt-5 rounded-[28px] border border-white/35 bg-white/78 p-5">
          <Text className="text-[18px] font-semibold text-text">{selectedDateLabel}</Text>
          <Text className="mt-1 text-sm text-muted">
            {selectedAgenda.timeline.length
              ? `${selectedAgenda.timeline.length} actividades programadas`
              : "Todavía no cargaste actividades para este día."}
          </Text>

          <View className="mt-4 gap-3">
            {selectedAgenda.timeline.length ? (
              selectedAgenda.timeline.map((event) => (
                <View key={event.id} className="rounded-[22px] bg-surface px-4 py-4">
                  <Text className="text-xs font-medium uppercase tracking-[1px] text-muted">{event.time}</Text>
                  <Text className="mt-1 text-base font-semibold text-text">{event.title}</Text>
                  <Text className="mt-1 text-sm leading-5 text-muted">{event.description}</Text>
                </View>
              ))
            ) : (
              <View className="rounded-[22px] bg-surface px-4 py-5">
                <Text className="text-sm leading-6 text-muted">
                  Elegí un día y cargá tus bloques desde la pestaña de planificación.
                </Text>
              </View>
            )}
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
