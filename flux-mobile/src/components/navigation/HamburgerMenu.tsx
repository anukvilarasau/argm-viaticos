import { Feather } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useEffect, useRef, useState } from "react";
import { Animated, Modal, Pressable, Text, View } from "react-native";

type HamburgerMenuProps = {
  completedGoals: number;
  onClose: () => void;
  onOpenInsights: () => void;
  onOpenLume: () => void;
  timelineCount: number;
  visible: boolean;
};

const MENU_WIDTH = 306;

export function HamburgerMenu({
  completedGoals,
  onClose,
  onOpenInsights,
  onOpenLume,
  timelineCount,
  visible,
}: HamburgerMenuProps) {
  const [shouldRender, setShouldRender] = useState(visible);
  const translateX = useRef(new Animated.Value(-MENU_WIDTH)).current;

  useEffect(() => {
    if (visible) {
      setShouldRender(true);
      Animated.timing(translateX, {
        toValue: 0,
        duration: 240,
        useNativeDriver: true,
      }).start();
      return;
    }

    Animated.timing(translateX, {
      toValue: -MENU_WIDTH,
      duration: 220,
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
      <View className="flex-1 flex-row bg-text/20">
        <Animated.View style={{ transform: [{ translateX }] }}>
          <BlurView
            intensity={54}
            tint="light"
            style={{
              width: MENU_WIDTH,
              height: "100%",
              overflow: "hidden",
              borderTopRightRadius: 36,
              borderBottomRightRadius: 36,
            }}
          >
            <View className="flex-1 bg-white/78 px-5 pb-8 pt-16">
              <View className="mb-6 flex-row items-center justify-between">
                <View>
                  <Text className="text-sm font-medium uppercase tracking-[1.4px] text-muted">Flux Menu</Text>
                  <Text className="mt-2 text-3xl font-semibold text-text">Your day, your rules.</Text>
                </View>

                <Pressable className="h-11 w-11 items-center justify-center rounded-full bg-white/80" onPress={onClose}>
                  <Feather color="#17181C" name="x" size={18} />
                </Pressable>
              </View>

              <View className="mb-6 rounded-[28px] bg-[#13141A] p-5">
                <Text className="text-sm text-white/65">Today snapshot</Text>
                <Text className="mt-3 text-4xl font-semibold text-white">{completedGoals}</Text>
                <Text className="mt-1 text-sm text-white/65">Goals completed</Text>

                <View className="mt-5 rounded-[22px] bg-white/8 px-4 py-4">
                  <Text className="text-sm text-white/65">Timeline blocks</Text>
                  <Text className="mt-2 text-2xl font-semibold text-white">{timelineCount}</Text>
                </View>
              </View>

              <View className="gap-3">
                <Pressable className="rounded-[24px] bg-accent px-5 py-4" onPress={onOpenLume}>
                  <Text className="text-base font-semibold text-white">Open Lume AI</Text>
                  <Text className="mt-1 text-sm text-white/75">Get suggestions after you set your agenda.</Text>
                </Pressable>

                <Pressable className="rounded-[24px] bg-surfaceSoft px-5 py-4" onPress={onOpenInsights}>
                  <Text className="text-base font-semibold text-text">Go to Insights</Text>
                  <Text className="mt-1 text-sm text-muted">Check the charts and completion signals.</Text>
                </Pressable>

                <View className="rounded-[24px] bg-[#F5F2FF] px-5 py-4">
                  <Text className="text-base font-semibold text-text">Planning note</Text>
                  <Text className="mt-1 text-sm leading-5 text-muted">
                    The agenda now starts empty so you can shape the day instead of adapting to a preset.
                  </Text>
                </View>
              </View>
            </View>
          </BlurView>
        </Animated.View>

        <Pressable className="flex-1" onPress={onClose} />
      </View>
    </Modal>
  );
}
