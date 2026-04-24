import { LinearGradient } from "expo-linear-gradient";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { useEffect } from "react";
import { View } from "react-native";

export function AiOrb() {
  const pulse = useSharedValue(1);
  const rotation = useSharedValue(0);

  useEffect(() => {
    pulse.value = withRepeat(
      withSequence(
        withTiming(1.06, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: 1800, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      false,
    );

    rotation.value = withRepeat(
      withTiming(360, { duration: 12000, easing: Easing.linear }),
      -1,
      false,
    );
  }, [pulse, rotation]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulse.value }, { rotate: `${rotation.value}deg` }],
  }));

  return (
    <View className="items-center justify-center">
      <View className="absolute h-28 w-28 rounded-full bg-accent/10" />
      <Animated.View style={orbStyle}>
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
