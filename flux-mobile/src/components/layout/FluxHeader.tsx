import { Pressable, Text, View } from "react-native";

type FluxHeaderProps = {
  activeItem: "inicio" | "planificacion";
  onPressHome: () => void;
  onPressPlanning: () => void;
};

function NavItem({
  active,
  label,
  onPress,
}: {
  active?: boolean;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable className="px-2 py-2" disabled={!onPress} onPress={onPress}>
      <Text className={`text-base font-medium ${active ? "text-text underline" : "text-text/90"}`}>{label}</Text>
    </Pressable>
  );
}

export function FluxHeader({ activeItem, onPressHome, onPressPlanning }: FluxHeaderProps) {
  return (
    <View className="rounded-[28px] border border-white/50 bg-white/90 px-5 py-4 shadow-sm">
      <View className="flex-row flex-wrap items-center justify-between gap-3">
        <View className="flex-row items-center">
          <View className="h-11 w-11 rounded-full bg-fuchsia-200" style={{ backgroundColor: "#E68BF7" }} />
          <View className="absolute ml-2 h-11 w-11 rounded-full bg-sky-200 opacity-80" style={{ backgroundColor: "#93E4FF" }} />
          <View className="absolute ml-4 h-11 w-11 rounded-full bg-green-200 opacity-70" style={{ backgroundColor: "#A7F0C3" }} />
          <Text className="ml-14 text-[22px] font-semibold text-text">Flux</Text>
        </View>

        <View className="flex-row flex-wrap items-center gap-5">
          <NavItem active={activeItem === "inicio"} label="Inicio" onPress={onPressHome} />
          <NavItem active={activeItem === "planificacion"} label="Planificación" onPress={onPressPlanning} />
        </View>

        <Pressable className="rounded-full bg-accent px-5 py-3">
          <Text className="text-base font-medium text-white">Ingresar / Registro</Text>
        </Pressable>
      </View>
    </View>
  );
}
