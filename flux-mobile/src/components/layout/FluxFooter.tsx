import { Text, View } from "react-native";
import { Feather } from "@expo/vector-icons";

export function FluxFooter() {
  return (
    <View className="mt-8 rounded-[28px] bg-black/22 px-6 py-5">
      <View className="flex-row flex-wrap items-center justify-between gap-5">
        <Text className="text-4xl font-semibold lowercase text-white">flux</Text>

        <View className="flex-row items-center gap-4">
          <Feather color="rgba(255,255,255,0.85)" name="facebook" size={20} />
          <Feather color="rgba(255,255,255,0.85)" name="x" size={20} />
          <Feather color="rgba(255,255,255,0.85)" name="instagram" size={20} />
          <Feather color="rgba(255,255,255,0.85)" name="youtube" size={20} />
        </View>

        <View className="flex-row flex-wrap items-center gap-5">
          <Text className="text-sm text-white/80">Inicio</Text>
          <Text className="text-sm text-white/80">Legal</Text>
          <Text className="text-sm text-white/80">Eventos</Text>
          <Text className="text-sm text-white/80">Precios</Text>
          <Text className="text-sm text-white/80">Blogs</Text>
          <Text className="text-sm text-white/80">Copyright © 2022</Text>
        </View>
      </View>
    </View>
  );
}
