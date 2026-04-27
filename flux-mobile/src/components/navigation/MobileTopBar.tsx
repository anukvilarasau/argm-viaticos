import { Feather } from "@expo/vector-icons";
import { Pressable, Text, View } from "react-native";

type MobileTopBarProps = {
  onOpenMenu: () => void;
  title: string;
};

export function MobileTopBar({ onOpenMenu, title }: MobileTopBarProps) {
  return (
    <View className="mb-6 flex-row items-center justify-between rounded-[26px] border border-white/35 bg-white/88 px-4 py-4">
      <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-surfaceSoft" onPress={onOpenMenu}>
        <Feather color="#17181C" name="menu" size={18} />
      </Pressable>

      <Text className="text-[20px] font-semibold text-text">{title}</Text>

      <View className="h-11 w-11 items-center justify-center rounded-full bg-[#F3EEFF]">
        <View className="h-5 w-5 rounded-full bg-[#E68BF7]/70" />
      </View>
    </View>
  );
}
