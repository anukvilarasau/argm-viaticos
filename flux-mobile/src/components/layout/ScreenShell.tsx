import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

export function ScreenShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#2F403E" }}>
      <View style={{ flex: 1, backgroundColor: "#2F403E" }}>
        <View className="absolute inset-0 bg-[#314240]" pointerEvents="none" />
        <View className="absolute left-[-80px] top-12 h-80 w-80 rounded-full bg-white/45" pointerEvents="none" />
        <View className="absolute left-28 top-40 h-96 w-64 rounded-full bg-[#A46C44]/25" pointerEvents="none" />
        <View className="absolute right-[-60px] top-24 h-72 w-72 rounded-full bg-white/12" pointerEvents="none" />
        <View className="absolute bottom-[-90px] right-[-40px] h-80 w-80 rounded-full bg-[#8D5B34]/30" pointerEvents="none" />
        <View className="absolute bottom-[-20px] left-0 right-0 h-40 bg-black/25" pointerEvents="none" />
        {children}
      </View>
    </SafeAreaView>
  );
}
