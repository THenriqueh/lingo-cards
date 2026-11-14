import { useEffect, useState } from 'react';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSpring, withTiming } from 'react-native-reanimated';
import Svg, { Circle, G, Path, Rect } from 'react-native-svg';
import { cores } from '@/theme';

export type Humor = 'neutro' | 'feliz' | 'comemorando' | 'triste' | 'surpreso' | 'pensando';

type Visual = 'acertei' | 'quase' | 'errei' | 'comemorando';

// Cada humor muda a cor e a inclinação do cartão.
const VISUAL: Record<Humor, Visual> = {
  neutro: 'acertei',
  feliz: 'acertei',
  comemorando: 'comemorando',
  surpreso: 'quase',
  pensando: 'quase',
  triste: 'errei',
};
const COR: Record<Visual, string> = { acertei: cores.lima, comemorando: cores.lima, quase: cores.iris, errei: cores.coral };
const INCLINACAO: Record<Visual, number> = { acertei: -6, comemorando: 8, quase: 4, errei: -2 };

const ROSTO = cores.sobreCor;

type Props = { humor?: Humor; tamanho?: number };

/** Lingo, o mascote: um cartão de estudo que reage às respostas. */
export function Lingo({ humor = 'feliz', tamanho = 64 }: Props) {
  const visual = VISUAL[humor];
  const [piscando, setPiscando] = useState(false);
  const inclinacao = useSharedValue(INCLINACAO[visual]);
  const flutuar = useSharedValue(0);

  useEffect(() => {
    inclinacao.value = withSpring(INCLINACAO[visual], { damping: 9, stiffness: 160 });
  }, [visual, inclinacao]);

  useEffect(() => {
    flutuar.value = withRepeat(withTiming(1, { duration: 1800 }), -1, true);
  }, [flutuar]);

  useEffect(() => {
    let abrir: ReturnType<typeof setTimeout>;
    const intervalo = setInterval(() => {
      setPiscando(true);
      abrir = setTimeout(() => setPiscando(false), 120);
    }, 3600);
    return () => {
      clearInterval(intervalo);
      clearTimeout(abrir);
    };
  }, []);

  const estilo = useAnimatedStyle(() => ({
    transform: [{ translateY: -2 * flutuar.value }, { rotate: `${inclinacao.value}deg` }],
  }));

  const altura = (tamanho * 76) / 64;

  return (
    <Animated.View style={[{ width: tamanho, height: altura }, estilo]}>
      <Svg width={tamanho} height={altura} viewBox="0 0 64 76">
        <Rect x="6" y="4" width="52" height="68" rx="10" fill={COR[visual]} />
        <Rosto visual={visual} piscando={piscando} />
      </Svg>
    </Animated.View>
  );
}

function Rosto({ visual, piscando }: { visual: Visual; piscando: boolean }) {
  const olho = (cx: number, cy: number) =>
    piscando ? (
      <Path d={`M${cx - 4} ${cy} L${cx + 4} ${cy}`} stroke={ROSTO} strokeWidth={3.5} strokeLinecap="round" />
    ) : (
      <Circle cx={cx} cy={cy} r="4" fill={ROSTO} />
    );

  switch (visual) {
    case 'comemorando':
      return (
        <G>
          <Path d="M18 33 L23 27 L28 33 M36 33 L41 27 L46 33" stroke={ROSTO} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          <Path d="M22 42 Q32 56 42 42 Z" fill={ROSTO} />
        </G>
      );
    case 'quase':
      return (
        <G>
          <Path d="M18 32 L28 32" stroke={ROSTO} strokeWidth={3.5} strokeLinecap="round" />
          {olho(41, 32)}
          <Path d="M25 46 L39 44" stroke={ROSTO} strokeWidth={3.5} strokeLinecap="round" />
        </G>
      );
    case 'errei':
      return (
        <G>
          {olho(23, 33)}
          {olho(41, 33)}
          <Path d="M24 50 Q32 42 40 50" stroke={ROSTO} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </G>
      );
    default:
      return (
        <G>
          {olho(23, 32)}
          {olho(41, 32)}
          <Path d="M24 44 Q32 52 40 44" stroke={ROSTO} strokeWidth={3.5} fill="none" strokeLinecap="round" />
        </G>
      );
  }
}
