import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

import { AgendaDay, ISODateString } from "../../types";
import { addDaysToIso, formatDayNumber, formatMonthShort, formatWeekdayShort, timeToMinutes } from "../../utils/date";

type WeeklyPlannerBoardProps = {
  agendaByDate: Record<ISODateString, AgendaDay>;
  selectedDate: ISODateString;
  weekDates: ISODateString[];
  onSelectDate: (date: ISODateString) => void;
};

const START_HOUR = 6;
const END_HOUR = 22;
const HOUR_HEIGHT = 29;
const BOARD_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT;
const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, index) => START_HOUR + index);

const categoryTone = {
  focus: "bg-[#7C58F6]",
  social: "bg-[#95F0C2]",
  wellness: "bg-[#86B2FF]",
  work: "bg-[#B79BFF]",
};

export function WeeklyPlannerBoard({
  agendaByDate,
  onSelectDate,
  selectedDate,
  weekDates,
}: WeeklyPlannerBoardProps) {
  return (
    <View className="rounded-[32px] border border-white/40 bg-white/74 p-4 shadow-sm">
      <View className="mb-4 flex-row items-center justify-between">
        <View>
          <Text className="text-sm font-medium uppercase tracking-[1.6px] text-text/65">Calendario dinámico</Text>
          <Text className="mt-2 text-[24px] font-semibold capitalize text-text">{formatMonthShort(selectedDate)}</Text>
        </View>

        <View className="flex-row gap-2">
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
            onPress={() => onSelectDate(addDaysToIso(selectedDate, -7))}
          >
            <Feather color="#17181C" name="chevron-left" size={20} />
          </Pressable>
          <Pressable
            className="h-10 w-10 items-center justify-center rounded-full bg-white/90"
            onPress={() => onSelectDate(addDaysToIso(selectedDate, 7))}
          >
            <Feather color="#17181C" name="chevron-right" size={20} />
          </Pressable>
        </View>
      </View>

      <View className="flex-row">
        <View className="mr-2 w-12">
          <View className="h-12" />
          {hours.slice(0, -1).map((hour) => (
            <View key={hour} style={{ height: HOUR_HEIGHT }}>
              <Text className="text-xs font-medium text-text/55">{`${String(hour).padStart(2, "0")}:00`}</Text>
            </View>
          ))}
        </View>

        <View className="flex-1 flex-row gap-[6px]">
          {weekDates.map((date) => {
            const active = date === selectedDate;
            const dayAgenda = agendaByDate[date] ?? { goals: [], timeline: [] };

            return (
              <Pressable key={date} className="flex-1" onPress={() => onSelectDate(date)}>
                <View className={`mb-2 rounded-[18px] px-1 py-2 ${active ? "bg-[#ECE4FF]" : "bg-white/60"}`}>
                  <Text className="text-center text-xs font-medium uppercase text-text/55">{formatWeekdayShort(date)}</Text>
                  <Text className={`mt-1 text-center text-[20px] font-semibold ${active ? "text-accent" : "text-text"}`}>
                    {formatDayNumber(date)}
                  </Text>
                </View>

                <View className="relative overflow-hidden rounded-[22px] border border-black/5 bg-white/55" style={{ height: BOARD_HEIGHT }}>
                  {hours.slice(0, -1).map((hour) => (
                    <View
                      key={`${date}-${hour}`}
                      className="border-b border-black/5"
                      style={{ height: HOUR_HEIGHT }}
                    />
                  ))}

                  {dayAgenda.timeline.map((event) => {
                    const totalMinutes = timeToMinutes(event.time);

                    if (totalMinutes === null) {
                      return null;
                    }

                    const clampedMinutes = Math.max(START_HOUR * 60, Math.min(totalMinutes, END_HOUR * 60 - 45));
                    const top = ((clampedMinutes - START_HOUR * 60) / 60) * HOUR_HEIGHT;

                    return (
                      <View
                        key={event.id}
                        className={`absolute left-1 right-1 rounded-[14px] px-2 py-2 shadow-sm ${categoryTone[event.category]}`}
                        style={{ minHeight: 48, top }}
                      >
                        <Text className="text-xs font-semibold text-[#13211E]">{event.title}</Text>
                        <Text className="mt-1 text-[11px] text-[#13211E]/70">{event.time}</Text>
                      </View>
                    );
                  })}

                  {active && !dayAgenda.timeline.length ? (
                    <View className="absolute inset-x-2 top-32 items-center rounded-[18px] bg-white/90 px-3 py-5">
                      <Feather color="#17181C" name="plus" size={24} />
                    </View>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
    </View>
  );
}
