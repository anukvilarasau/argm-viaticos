import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type LumeLauncherProps = {
  onPress: () => void;
};

export function LumeLauncher({ onPress }: LumeLauncherProps) {
  return (
    <View className="absolute bottom-6 right-6 items-end">
      <View className="mb-3 rounded-[22px] bg-white px-5 py-3 shadow-sm">
        <View className="flex-row items-center gap-2">
          <Feather color="#6F7483" name="message-circle" size={18} />
          <Text className="text-[16px] font-semibold text-text">Lume</Text>
        </View>
      </View>

      <Pressable className="h-[88px] w-[88px] items-center justify-center rounded-full bg-[#E78DF4]/70 shadow-lg" onPress={onPress}>
        <View className="absolute h-[88px] w-[88px] rounded-full bg-[#A58BFF]/40" />
        <View className="absolute h-[74px] w-[74px] rounded-full bg-[#92E7FF]/45" />
        <View className="h-[60px] w-[60px] rounded-full bg-[#9EF0C4]/70" />
      </Pressable>
    </View>
  );
}
