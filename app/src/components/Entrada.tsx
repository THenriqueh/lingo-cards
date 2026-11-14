import type { ReactNode } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

type Props = { children: ReactNode; indice?: number; style?: StyleProp<ViewStyle> };

/** Faz o conteúdo surgir de baixo para cima; itens de lista entram em cascata pelo índice. */
export function Entrada({ children, indice = 0, style }: Props) {
  return (
    <Animated.View entering={FadeInDown.delay(Math.min(indice, 8) * 50).duration(300)} style={style}>
      {children}
    </Animated.View>
  );
}
