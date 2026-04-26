import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

export function AiOrb() {
  const pulse = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.08,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ]),
    );

    const rotationLoop = Animated.loop(
      Animated.timing(rotation, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );

    pulseLoop.start();
    rotationLoop.start();

    return () => {
      pulseLoop.stop();
      rotationLoop.stop();
    };
  }, [pulse, rotation]);

  const spin = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <View className="items-center justify-center" pointerEvents="none">
      <Animated.View style={{ transform: [{ scale: pulse }, { rotate: spin }] }}>
        <View className="h-[78px] w-[78px] items-center justify-center rounded-full bg-[#F1D2FF]/95">
          <View className="absolute h-[78px] w-[78px] rounded-full bg-[#8DE1FF]/45" />
          <View className="absolute h-[60px] w-[60px] rounded-full bg-[#A7FFCF]/55" />
          <View className="absolute h-[42px] w-[42px] rounded-full bg-[#CFC3FF]/70" />
        </View>
      </Animated.View>
    </View>
  );
}
