import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";

type MobileNavMenuProps = {
  onClose: () => void;
  onOpenCalendar: () => void;
  onOpenHome: () => void;
  onOpenLume: () => void;
  onOpenPlanning: () => void;
  visible: boolean;
};

const MENU_WIDTH = 286;

function MenuButton({
  icon,
  label,
  onPress,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable className="flex-row items-center rounded-[22px] bg-white/85 px-4 py-4" onPress={onPress}>
      <Feather color="#6D4AFF" name={icon} size={18} />
      <Text className="ml-3 text-base font-semibold text-text">{label}</Text>
    </Pressable>
  );
}

export function MobileNavMenu({
  onClose,
  onOpenCalendar,
  onOpenHome,
  onOpenLume,
  onOpenPlanning,
  visible,
}: MobileNavMenuProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(translateX, {
      toValue: -MENU_WIDTH,
      duration: 180,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setShouldRender(false);
      }
    });
  }, [translateX, visible]);

  if (!shouldRender) {
    return null;
  }

  return (
    <Modal animationType="none" transparent visible={shouldRender}>
      <View className="flex-1 flex-row bg-text/15">
        <Animated.View style={{ transform: [{ translateX }] }}>
          <BlurView
            intensity={46}
            tint="light"
            style={{
              width: MENU_WIDTH,
              height: "100%",
              overflow: "hidden",
              borderTopRightRadius: 34,
              borderBottomRightRadius: 34,
            }}
          >
            <View className="flex-1 bg-white/80 px-5 pb-8 pt-16">
              <View className="mb-6 flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium uppercase tracking-[1.3px] text-muted">Navegación</Text>
                  <Text className="mt-2 text-[28px] font-semibold text-text">Flux mobile</Text>
                </View>

                <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/90" onPress={onClose}>
                  <Feather color="#17181C" name="x" size={18} />
                </Pressable>
              </View>

              <View className="gap-3">
                <MenuButton icon="home" label="Inicio" onPress={onOpenHome} />
                <MenuButton icon="edit-3" label="Planificación" onPress={onOpenPlanning} />
                <MenuButton icon="calendar" label="Calendario" onPress={onOpenCalendar} />
                <MenuButton icon="message-circle" label="Abrir Lume" onPress={onOpenLume} />
              </View>
            </View>
          </BlurView>
        </Animated.View>

        <Pressable className="flex-1" onPress={onClose} />
      </View>
    </Modal>
  );
}
