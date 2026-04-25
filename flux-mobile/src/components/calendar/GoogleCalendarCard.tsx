import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type GoogleCalendarCardProps = {
  canExport: boolean;
  canImport: boolean;
  email: string | null;
  isConfigured: boolean;
  isConnected: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
  onExport: () => void;
  onImport: () => void;
  selectedDateLabel: string;
  status: "idle" | "connecting" | "connected" | "error";
};

export function GoogleCalendarCard({
  canExport,
  canImport,
  email,
  isConfigured,
  isConnected,
  onConnect,
  onDisconnect,
  onExport,
  onImport,
  selectedDateLabel,
  status,
}: GoogleCalendarCardProps) {
  return (
    <View className="mt-8 overflow-hidden rounded-[32px] bg-surface p-5">
      <View className="absolute right-[-18px] top-[-18px] h-28 w-28 rounded-full bg-[#E8F0FF]" />
      <View className="flex-row items-start justify-between">
        <View className="flex-1 pr-4">
          <Text className="text-xl font-semibold text-text">Google Calendar</Text>
          <Text className="mt-1 text-sm leading-5 text-muted">
            Connect your account to import or export the plan for {selectedDateLabel}.
          </Text>
        </View>
        <View className="h-12 w-12 items-center justify-center rounded-full bg-[#F5F2FF]">
          <Feather color="#6D4AFF" name="calendar" size={18} />
        </View>
      </View>

      <View className="mt-4 rounded-[24px] bg-surfaceSoft p-4">
        <Text className="text-sm font-medium text-text">
          {isConnected ? `Connected as ${email ?? "Google user"}` : isConfigured ? "Connection ready" : "Missing OAuth client IDs"}
        </Text>
        <Text className="mt-1 text-sm text-muted">
          {isConfigured
            ? status === "connecting"
              ? "Opening Google sign-in..."
              : "Flux uses Google OAuth and the Calendar API scopes for read/write sync."
            : "Add EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID and native client IDs to enable account linking."}
        </Text>
      </View>

      <View className="mt-4 gap-3">
        {!isConnected ? (
          <Pressable className={`rounded-[24px] px-5 py-4 ${isConfigured ? "bg-accent" : "bg-border"}`} disabled={!isConfigured} onPress={onConnect}>
            <Text className="text-base font-semibold text-white">{isConfigured ? "Connect Google Calendar" : "Configure OAuth first"}</Text>
          </Pressable>
        ) : (
          <>
            <Pressable className={`rounded-[24px] px-5 py-4 ${canImport ? "bg-[#14151C]" : "bg-border"}`} disabled={!canImport} onPress={onImport}>
              <Text className="text-base font-semibold text-white">Import events for this date</Text>
            </Pressable>
            <Pressable className={`rounded-[24px] px-5 py-4 ${canExport ? "bg-accent" : "bg-border"}`} disabled={!canExport} onPress={onExport}>
              <Text className="text-base font-semibold text-white">Export Flux timeline to Google</Text>
            </Pressable>
            <Pressable className="rounded-[24px] bg-surfaceSoft px-5 py-4" onPress={onDisconnect}>
              <Text className="text-base font-semibold text-text">Disconnect</Text>
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
