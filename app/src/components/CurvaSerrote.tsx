import Svg, { Circle, Path } from 'react-native-svg';
import { cores } from '@/theme';

/**
 * A curva do esquecimento "em serrote": a memória cai com o tempo e cada revisão a levanta de novo.
 * A cada revisão a queda fica mais lenta — é a ideia do app desenhada.
 */
export function CurvaSerrote({ largura = 240, altura = 56, cor = cores.sobreCor }: { largura?: number; altura?: number; cor?: string }) {
  const trechos = [0.16, 0.2, 0.26, 0.38];
  const quedas = [0.75, 0.45, 0.3, 0.2];
  let x = 2;
  let d = `M${x} ${altura * 0.12}`;
  trechos.forEach((t, i) => {
    const w = (largura - 8) * t;
    const topo = altura * 0.12;
    const fundo = topo + (altura * 0.8) * quedas[i];
    d += ` Q${x + w * 0.25} ${fundo} ${x + w} ${fundo}`;
    x += w;
    if (i < trechos.length - 1) d += ` L${x} ${topo + altura * 0.05 * i}`;
  });
  const fim = d.split(' ').slice(-2).map(Number);
  return (
    <Svg width={largura} height={altura}>
      <Path d={d} stroke={cor} strokeWidth={2} fill="none" strokeLinejoin="round" strokeLinecap="round" />
      <Circle cx={fim[0]} cy={fim[1]} r={3.5} fill={cor} />
    </Svg>
  );
}
