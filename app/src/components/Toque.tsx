import type { ReactNode } from 'react';
import { Pressable, type StyleProp, type ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { feedback } from '@/lib/feedback';

const PressableAnimado = Animated.createAnimatedComponent(Pressable);
const MOLA = { damping: 15, stiffness: 400 };

type Props = { children: ReactNode; aoPressionar: () => void; style?: StyleProp<ViewStyle> };

/** Área tocável que "afunda" levemente ao toque, com uma vibração sutil. */
export function Toque({ children, aoPressionar, style }: Props) {
  const escala = useSharedValue(1);
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));

  return (
    <PressableAnimado
      style={[estilo, style]}
      onPressIn={() => {
        escala.value = withSpring(0.97, MOLA);
      }}
      onPressOut={() => {
        escala.value = withSpring(1, MOLA);
      }}
      onPress={() => {
        feedback.toque();
        aoPressionar();
      }}
    >
      {children}
    </PressableAnimado>
  );
}
