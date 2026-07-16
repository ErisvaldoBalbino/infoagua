/* eslint-disable react-hooks/immutability */
import { useSharedValue, useAnimatedStyle, withSpring } from "react-native-reanimated";

export function useButtonScale() {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const onPressIn = () => {
    scale.value = withSpring(0.96);
  };

  const onPressOut = () => {
    scale.value = withSpring(1);
  };

  return {
    animatedStyle,
    onPressIn,
    onPressOut,
  };
}
