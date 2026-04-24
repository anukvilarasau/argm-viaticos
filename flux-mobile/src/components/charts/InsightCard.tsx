import { PropsWithChildren } from "react";
import { Text, View } from "react-native";

type InsightCardProps = PropsWithChildren<{
  title: string;
  subtitle?: string;
}>;

export function InsightCard({ children, subtitle, title }: InsightCardProps) {
  return (
    <View className="rounded-[28px] bg-surface p-5">
      <Text className="text-lg font-semibold text-text">{title}</Text>
      {subtitle ? <Text className="mt-1 text-sm text-muted">{subtitle}</Text> : null}
      <View className="mt-5">{children}</View>
    </View>
  );
}
