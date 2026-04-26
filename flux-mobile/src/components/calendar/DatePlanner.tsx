import { Calendar, DateData } from "react-native-calendars";
import { Text, View } from "react-native";

import { ISODateString } from "../../types";
import { appTheme } from "../../theme";
import { formatMonthLabel } from "../../utils/date";

type DatePlannerProps = {
  datesWithItems: ISODateString[];
  selectedDate: ISODateString;
  onSelectDate: (date: ISODateString) => void;
};

export function DatePlanner({ datesWithItems, onSelectDate, selectedDate }: DatePlannerProps) {
  const markedDates = datesWithItems.reduce<Record<string, any>>((accumulator, date) => {
    accumulator[date] = {
      marked: true,
      dotColor: appTheme.colors.accent,
      selected: date === selectedDate,
      selectedColor: appTheme.colors.accent,
    };
    return accumulator;
  }, {});

  if (!markedDates[selectedDate]) {
    markedDates[selectedDate] = {
      selected: true,
      selectedColor: appTheme.colors.accent,
    };
  }

  return (
    <View className="rounded-[32px] bg-surface p-5">
      <View className="mb-4">
        <Text className="text-xl font-semibold text-text">Calendar</Text>
        <Text className="mt-1 text-sm text-muted">{formatMonthLabel(selectedDate)}. Tap any day to plan ahead.</Text>
      </View>

      <Calendar
        enableSwipeMonths
        firstDay={1}
        markedDates={markedDates}
        onDayPress={(day: DateData) => onSelectDate(day.dateString)}
        theme={{
          arrowColor: appTheme.colors.accent,
          backgroundColor: appTheme.colors.surface,
          calendarBackground: appTheme.colors.surface,
          dayTextColor: appTheme.colors.text,
          monthTextColor: appTheme.colors.text,
          selectedDayBackgroundColor: appTheme.colors.accent,
          selectedDayTextColor: "#FFFFFF",
          textDisabledColor: "#CBD0DC",
          todayTextColor: appTheme.colors.accent,
          textDayFontFamily: "Inter_500Medium",
          textMonthFontFamily: "Inter_600SemiBold",
          textDayHeaderFontFamily: "Inter_500Medium",
        }}
      />
    </View>
  );
}
