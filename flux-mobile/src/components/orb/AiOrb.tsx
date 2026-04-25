import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useRef } from "react";
import { Animated, Easing, View } from "react-native";

export function AiOrb() {
  const pulse = useRef(new Animated.Value(1)).current;
  const rotation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.06,
          duration: 1800,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1800,
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
      <View className="absolute h-28 w-28 rounded-full bg-accent/10" pointerEvents="none" />
      <Animated.View
        pointerEvents="none"
        style={{
          transform: [{ scale: pulse }, { rotate: spin }],
        }}
      >
        <LinearGradient
          colors={["#FF8ED8", "#8DE1FF", "#A7FFCF", "#CFC3FF"]}
          end={{ x: 1, y: 1 }}
          start={{ x: 0, y: 0 }}
          style={{
            width: 76,
            height: 76,
            borderRadius: 38,
            shadowColor: "#6D4AFF",
            shadowOpacity: 0.18,
            shadowRadius: 18,
            shadowOffset: { width: 0, height: 8 },
          }}
        />
      </Animated.View>
    </View>
  );
}
