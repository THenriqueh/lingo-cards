import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Path, Rect } from 'react-native-svg';
import { cores, fontes } from '@/theme';

/** Símbolo: dois cartões e a curva do esquecimento quebrada por uma revisão. */
export function Simbolo({ tamanho = 40 }: { tamanho?: number }) {
  return (
    <Svg width={tamanho} height={tamanho} viewBox="0 0 92 92">
      <Rect x="20" y="14" width="52" height="66" rx="10" fill={cores.iris} transform="rotate(10 46 46)" />
      <Rect x="18" y="12" width="52" height="66" rx="10" fill={cores.lima} transform="rotate(-6 46 46)" />
      <Path
        d="M24 30 C34 54 42 60 50 62 L50 34 C56 48 62 52 70 53"
        stroke={cores.sobreCor}
        strokeWidth={4.5}
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="rotate(-6 46 46)"
      />
    </Svg>
  );
}

/** Logo completo: símbolo + "lingo" + "CARDS". */
export function Logo({ tamanho = 40 }: { tamanho?: number }) {
  return (
    <View style={styles.linha}>
      <Simbolo tamanho={tamanho} />
      <Text style={[styles.lingo, { fontSize: tamanho * 0.8 }]}>lingo</Text>
      <Text style={[styles.cards, { fontSize: Math.max(9, tamanho * 0.26) }]}>CARDS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  lingo: { fontFamily: fontes.titulo, color: cores.texto, letterSpacing: -1.5 },
  cards: { fontFamily: fontes.monoForte, color: cores.lima, letterSpacing: 4, marginLeft: 4, marginTop: 4 },
});
