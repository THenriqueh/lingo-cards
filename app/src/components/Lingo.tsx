import { useEffect, useState } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Rect, Stop } from 'react-native-svg';
import { cores } from '@/theme';

export type Humor = 'neutro' | 'feliz' | 'comemorando' | 'triste' | 'surpreso' | 'pensando';

type Props = { humor?: Humor; tamanho?: number };

const ESCURO = '#14102E';
const OLHO_ESQ = { x: 45, y: 58 };
const OLHO_DIR = { x: 69, y: 58 };

/**
 * Lingo, o mascote do app: um cartãozinho de estudo com expressões.
 * Desenho original em SVG; reage ao estudo trocando o humor.
 */
export function Lingo({ humor = 'feliz', tamanho = 120 }: Props) {
  const [piscando, setPiscando] = useState(false);
  const flutuar = useSharedValue(0);
  const escala = useSharedValue(1);
  const giro = useSharedValue(0);

  // Flutua devagar o tempo todo.
  useEffect(() => {
    flutuar.value = withRepeat(withTiming(1, { duration: 1600 }), -1, true);
  }, [flutuar]);

  // A cada mudança de humor, um "pulo" (ou um balançar, quando está triste).
  useEffect(() => {
    if (humor === 'triste') {
      giro.value = withSequence(
        withTiming(-6, { duration: 70 }),
        withTiming(6, { duration: 70 }),
        withTiming(-4, { duration: 70 }),
        withTiming(0, { duration: 70 }),
      );
    } else {
      escala.value = withSequence(withTiming(1.12, { duration: 110 }), withSpring(1, { damping: 8, stiffness: 220 }));
    }
  }, [humor, escala, giro]);

  // Pisca de vez em quando.
  useEffect(() => {
    let fechar: ReturnType<typeof setTimeout>;
    const intervalo = setInterval(() => {
      setPiscando(true);
      fechar = setTimeout(() => setPiscando(false), 130);
    }, 3200);
    return () => {
      clearInterval(intervalo);
      clearTimeout(fechar);
    };
  }, []);

  const estilo = useAnimatedStyle(() => ({
    transform: [
      { translateY: -5 * flutuar.value },
      { scale: escala.value },
      { rotate: `${giro.value}deg` },
    ],
  }));

  const olhosFechados = humor === 'comemorando' || piscando;

  return (
    <Animated.View style={[{ width: tamanho, height: tamanho }, estilo]}>
      <Svg width={tamanho} height={tamanho} viewBox="0 0 120 120">
        <Defs>
          <LinearGradient id="corpo" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#A99CFF" />
            <Stop offset="1" stopColor="#6C5CE7" />
          </LinearGradient>
          <LinearGradient id="costas" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor="#7BEADF" />
            <Stop offset="1" stopColor="#2BB3A6" />
          </LinearGradient>
        </Defs>

        {/* Sombra no chão */}
        <Ellipse cx="58" cy="114" rx="30" ry="4" fill="#000" opacity={0.25} />

        {/* Cartão de trás (o "verso") */}
        <Rect x="36" y="16" width="62" height="82" rx="14" fill="url(#costas)" transform="rotate(12 67 57)" />

        {/* Braços */}
        {humor === 'comemorando' ? (
          <>
            <Path d="M26 64 L12 42" stroke="#5A4BD6" strokeWidth={7} strokeLinecap="round" />
            <Path d="M88 60 L104 38" stroke="#5A4BD6" strokeWidth={7} strokeLinecap="round" />
          </>
        ) : (
          <>
            <Path d="M26 74 L16 88" stroke="#5A4BD6" strokeWidth={7} strokeLinecap="round" />
            <Path d="M89 72 L99 86" stroke="#5A4BD6" strokeWidth={7} strokeLinecap="round" />
          </>
        )}

        {/* Pés */}
        <Ellipse cx="45" cy="108" rx="8" ry="4.5" fill="#4B3DC2" />
        <Ellipse cx="70" cy="106" rx="8" ry="4.5" fill="#4B3DC2" />

        {/* Corpo: o cartão principal, levemente inclinado */}
        <G transform="rotate(-6 57 64)">
          <Rect x="22" y="20" width="70" height="86" rx="16" fill="url(#corpo)" />
          <Rect x="28" y="25" width="40" height="6" rx="3" fill="#FFFFFF" opacity={0.25} />

          {/* Bochechas */}
          <Ellipse cx="36" cy="72" rx="6" ry="3.5" fill={cores.rosa} opacity={0.55} />
          <Ellipse cx="78" cy="72" rx="6" ry="3.5" fill={cores.rosa} opacity={0.55} />

          {/* Sobrancelhas tristes */}
          {humor === 'triste' ? (
            <>
              <Path d="M37 50 L50 45" stroke={ESCURO} strokeWidth={3} strokeLinecap="round" />
              <Path d="M77 50 L64 45" stroke={ESCURO} strokeWidth={3} strokeLinecap="round" />
            </>
          ) : null}

          <Olhos humor={humor} fechados={olhosFechados} />
          <Boca humor={humor} />

          {/* Lágrima */}
          {humor === 'triste' ? <Path d="M38 66 Q35 72 38 74 Q41 72 38 66 Z" fill="#8FD3FF" /> : null}
        </G>

        {/* Detalhes de humor */}
        {humor === 'comemorando' ? (
          <>
            <Estrela x={14} y={20} cor={cores.destaque} />
            <Estrela x={104} y={16} cor={cores.rosa} />
            <Estrela x={108} y={62} cor={cores.secundaria} pequena />
          </>
        ) : null}
        {humor === 'pensando' ? (
          <>
            <Circle cx="98" cy="22" r="3" fill={cores.textoSuave} />
            <Circle cx="105" cy="13" r="4.5" fill={cores.textoSuave} />
          </>
        ) : null}
      </Svg>
    </Animated.View>
  );
}

function Olhos({ humor, fechados }: { humor: Humor; fechados: boolean }) {
  if (fechados) {
    // Olhos de "felicidade": arcos para cima.
    return (
      <>
        <Path d={`M${OLHO_ESQ.x - 7} ${OLHO_ESQ.y + 2} Q${OLHO_ESQ.x} ${OLHO_ESQ.y - 6} ${OLHO_ESQ.x + 7} ${OLHO_ESQ.y + 2}`} stroke={ESCURO} strokeWidth={3.5} strokeLinecap="round" fill="none" />
        <Path d={`M${OLHO_DIR.x - 7} ${OLHO_DIR.y + 2} Q${OLHO_DIR.x} ${OLHO_DIR.y - 6} ${OLHO_DIR.x + 7} ${OLHO_DIR.y + 2}`} stroke={ESCURO} strokeWidth={3.5} strokeLinecap="round" fill="none" />
      </>
    );
  }
  const raio = humor === 'surpreso' ? 5.2 : 4.2;
  const dy = humor === 'pensando' ? -3 : humor === 'triste' ? 2 : 0;
  const dx = humor === 'pensando' ? 2.5 : 0;
  return (
    <>
      {[OLHO_ESQ, OLHO_DIR].map((o) => (
        <G key={o.x}>
          <Ellipse cx={o.x} cy={o.y} rx="8" ry="9" fill="#FFFFFF" />
          <Circle cx={o.x + dx} cy={o.y + dy} r={raio} fill={ESCURO} />
          <Circle cx={o.x + dx + 1.6} cy={o.y + dy - 1.8} r="1.4" fill="#FFFFFF" />
        </G>
      ))}
    </>
  );
}

function Boca({ humor }: { humor: Humor }) {
  switch (humor) {
    case 'comemorando':
      return (
        <>
          <Path d="M45 76 Q57 96 69 76 Z" fill={ESCURO} />
          <Path d="M51 84 Q57 92 63 84 Q57 81 51 84 Z" fill={cores.rosa} />
        </>
      );
    case 'feliz':
      return <Path d="M47 77 Q57 90 67 77" stroke={ESCURO} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
    case 'triste':
      return <Path d="M49 85 Q57 77 65 85" stroke={ESCURO} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
    case 'surpreso':
      return <Ellipse cx="57" cy="82" rx="4.5" ry="5.5" fill={ESCURO} />;
    case 'pensando':
      return <Path d="M50 82 Q56 79 64 81" stroke={ESCURO} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
    default:
      return <Path d="M51 79 Q57 85 63 79" stroke={ESCURO} strokeWidth={3.5} strokeLinecap="round" fill="none" />;
  }
}

function Estrela({ x, y, cor, pequena }: { x: number; y: number; cor: string; pequena?: boolean }) {
  const r = pequena ? 4 : 6;
  const d = `M${x} ${y - r} Q${x} ${y} ${x + r} ${y} Q${x} ${y} ${x} ${y + r} Q${x} ${y} ${x - r} ${y} Q${x} ${y} ${x} ${y - r} Z`;
  return <Path d={d} fill={cor} />;
}
