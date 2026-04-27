import { Pressable, Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

type LumeLauncherProps = {
  onPress: () => void;
};

export function LumeLauncher({ onPress }: LumeLauncherProps) {
  return (
    <View className="absolute bottom-5 right-5 items-end">
      <View className="mb-2 rounded-[20px] bg-white px-4 py-3 shadow-sm">
        <View className="flex-row items-center gap-2">
          <Feather color="#6F7483" name="message-circle" size={17} />
          <Text className="text-[15px] font-semibold text-text">Lume</Text>
        </View>
      </View>

      <Pressable className="h-[76px] w-[76px] items-center justify-center rounded-full bg-[#E78DF4]/70 shadow-lg" onPress={onPress}>
        <View className="absolute h-[76px] w-[76px] rounded-full bg-[#A58BFF]/40" />
        <View className="absolute h-[64px] w-[64px] rounded-full bg-[#92E7FF]/45" />
        <View className="h-[50px] w-[50px] rounded-full bg-[#9EF0C4]/70" />
      </Pressable>
    </View>
  );
}
