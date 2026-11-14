import { useEffect, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withDelay, withTiming } from 'react-native-reanimated';
import { cores } from '@/theme';

const CORES = [cores.primaria, cores.secundaria, cores.destaque, cores.rosa, cores.acerto, '#FFFFFF'];

type Peca = { x: number; atraso: number; duracao: number; cor: string; largura: number; altura: number; giro: number; balanco: number };

function sortear(quantidade: number, largura: number): Peca[] {
  return Array.from({ length: quantidade }, (_, i) => ({
    x: Math.random() * largura,
    atraso: Math.random() * 500,
    duracao: 2400 + Math.random() * 1800,
    cor: CORES[i % CORES.length],
    largura: 6 + Math.random() * 6,
    altura: 10 + Math.random() * 8,
    giro: (Math.random() * 2 - 1) * 720,
    balanco: 20 + Math.random() * 40,
  }));
}

/** Chuva de confete por cima da tela (não bloqueia toques). */
export function Confete({ quantidade = 70 }: { quantidade?: number }) {
  const { width, height } = useWindowDimensions();
  const [pecas] = useState(() => sortear(quantidade, width));
  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {pecas.map((p, i) => (
        <PecaConfete key={i} peca={p} alturaTela={height} />
      ))}
    </View>
  );
}

function PecaConfete({ peca, alturaTela }: { peca: Peca; alturaTela: number }) {
  const t = useSharedValue(0);

  useEffect(() => {
    t.value = withDelay(peca.atraso, withTiming(1, { duration: peca.duracao, easing: Easing.linear }));
  }, [t, peca]);

  const estilo = useAnimatedStyle(() => ({
    opacity: t.value > 0.85 ? (1 - t.value) / 0.15 : 1,
    transform: [
      { translateX: peca.x + Math.sin(t.value * Math.PI * 4) * peca.balanco },
      { translateY: -40 + t.value * (alturaTela + 80) },
      { rotate: `${t.value * peca.giro}deg` },
      { rotateX: `${t.value * 900}deg` },
    ],
  }));

  return (
    <Animated.View
      style={[{ position: 'absolute', width: peca.largura, height: peca.altura, borderRadius: 2, backgroundColor: peca.cor }, estilo]}
    />
  );
}
