import { useEffect, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle, Defs, LinearGradient, Stop } from 'react-native-svg';
import { cores } from '@/theme';

const CirculoAnimado = Animated.createAnimatedComponent(Circle);

type Props = { valor: number; tamanho?: number; espessura?: number; children?: ReactNode };

/** Anel que se preenche de 0 até `valor` (0 a 1) com animação. */
export function AnelProgresso({ valor, tamanho = 190, espessura = 14, children }: Props) {
  const raio = (tamanho - espessura) / 2;
  const circunferencia = 2 * Math.PI * raio;
  const progresso = useSharedValue(0);

  useEffect(() => {
    progresso.value = withTiming(valor, { duration: 1100, easing: Easing.out(Easing.cubic) });
  }, [valor, progresso]);

  const propsAnimadas = useAnimatedProps(() => ({
    strokeDashoffset: circunferencia * (1 - progresso.value),
  }));

  return (
    <View style={{ width: tamanho, height: tamanho }}>
      <Svg width={tamanho} height={tamanho} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Defs>
          <LinearGradient id="anel" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={cores.secundaria} />
            <Stop offset="1" stopColor={cores.primaria} />
          </LinearGradient>
        </Defs>
        <Circle cx={tamanho / 2} cy={tamanho / 2} r={raio} stroke={cores.superficieAlta} strokeWidth={espessura} fill="none" />
        <CirculoAnimado
          cx={tamanho / 2}
          cy={tamanho / 2}
          r={raio}
          stroke="url(#anel)"
          strokeWidth={espessura}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circunferencia} ${circunferencia}`}
          animatedProps={propsAnimadas}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.centro]}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({ centro: { alignItems: 'center', justifyContent: 'center' } });
