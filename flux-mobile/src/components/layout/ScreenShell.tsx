import { PropsWithChildren } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { View } from "react-native";

export function ScreenShell({ children }: PropsWithChildren) {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9F9FB" }}>
      <View style={{ flex: 1, backgroundColor: "#F9F9FB" }}>{children}</View>
    </SafeAreaView>
  );
}
