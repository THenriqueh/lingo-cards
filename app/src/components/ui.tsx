// Peças de interface da marca (SCREENS.md): cartões, listas agrupadas, rótulos, cabeçalhos, chips e toggle.
import { Children, Fragment, isValidElement, type ReactNode, useEffect } from 'react';
import { Pressable, type StyleProp, StyleSheet, View, type ViewStyle } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import { feedback } from '@/lib/feedback';
import { brilho, cores, fontes } from '@/theme';

/** Cartão padrão: superfície, borda de 1px e raio 22. */
export function Cartao({ children, style, pequeno }: { children: ReactNode; style?: StyleProp<ViewStyle>; pequeno?: boolean }) {
  return <View style={[styles.cartao, pequeno && { borderRadius: 18 }, style]}>{children}</View>;
}

/** Rótulo de seção: mono, caixa alta. */
export function RotuloSecao({ children, cor, style }: { children: ReactNode; cor?: string; style?: StyleProp<ViewStyle> }) {
  return (
    <View style={style}>
      <Text style={[styles.rotuloSecao, cor ? { color: cor } : null]}>{children}</Text>
    </View>
  );
}

/** Várias linhas dentro de UM cartão, separadas por uma linha fina. */
export function ListaGrupo({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  const itens = Children.toArray(children).filter(isValidElement);
  return (
    <Cartao style={[{ paddingVertical: 0 }, style]}>
      {itens.map((item, i) => (
        <Fragment key={item.key ?? i}>
          {i > 0 ? <View style={styles.divisor} /> : null}
          {item}
        </Fragment>
      ))}
    </Cartao>
  );
}

type LinhaProps = {
  children: ReactNode;
  aoPressionar?: () => void;
  aoSegurar?: () => void;
  style?: StyleProp<ViewStyle>;
};

/** Linha de lista (padding 13×14), tocável se receber aoPressionar. */
export function Linha({ children, aoPressionar, aoSegurar, style }: LinhaProps) {
  if (!aoPressionar && !aoSegurar) return <View style={[styles.linha, style]}>{children}</View>;
  return (
    <Pressable
      onPress={aoPressionar}
      onLongPress={
        aoSegurar
          ? () => {
              feedback.alerta();
              aoSegurar();
            }
          : undefined
      }
      style={({ pressed }) => [styles.linha, pressed && { opacity: 0.6 }, style]}
    >
      {children}
    </Pressable>
  );
}

/** Cabeçalho de tela: rótulo mono + título; ação primária "+" opcional à direita. */
export function CabecalhoTela({ rotulo, titulo, aoAdicionar }: { rotulo?: string; titulo: string; aoAdicionar?: () => void }) {
  return (
    <View style={styles.cabecalho}>
      <View style={{ flex: 1, gap: 4 }}>
        {rotulo ? <Text style={styles.rotuloCabecalho}>{rotulo}</Text> : null}
        <Text style={styles.titulo}>{titulo}</Text>
      </View>
      {aoAdicionar ? <BotaoQuadrado icone="plus" aoPressionar={aoAdicionar} rotuloAcessivel="Adicionar" /> : null}
    </View>
  );
}

/** Botão quadrado lima (40×40, raio 14) — "+" do cabeçalho. */
export function BotaoQuadrado({ icone, aoPressionar, tamanho = 40, rotuloAcessivel }: { icone: string; aoPressionar: () => void; tamanho?: number; rotuloAcessivel?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={rotuloAcessivel}
      onPress={() => {
        feedback.toque();
        aoPressionar();
      }}
      style={({ pressed }) => [
        styles.quadrado,
        { width: tamanho, height: tamanho, borderRadius: tamanho * 0.33 },
        brilho(cores.lima),
        pressed && { transform: [{ scale: 0.94 }] },
      ]}
    >
      <Icon source={icone} size={tamanho * 0.55} color={cores.sobreCor} />
    </Pressable>
  );
}

/** Chip de filtro (altura 32, raio 11). Ativo: claro com texto escuro. */
export function ChipFiltro({ ativo, children, aoPressionar }: { ativo: boolean; children: ReactNode; aoPressionar: () => void }) {
  return (
    <Pressable
      onPress={() => {
        feedback.selecao();
        aoPressionar();
      }}
      style={[styles.chip, ativo ? styles.chipAtivo : styles.chipInativo]}
    >
      <Text style={[styles.chipTexto, { color: ativo ? cores.fundo : cores.texto }]}>{children}</Text>
    </Pressable>
  );
}

/** Toggle da marca (44×26): ligado = trilho lima + botão escuro. */
export function Toggle({ ligado, aoAlternar }: { ligado: boolean; aoAlternar: () => void }) {
  const x = useSharedValue(ligado ? 1 : 0);
  useEffect(() => {
    x.value = withSpring(ligado ? 1 : 0, { damping: 14, stiffness: 260 });
  }, [ligado, x]);
  const estiloBotao = useAnimatedStyle(() => ({ transform: [{ translateX: 3 + 18 * x.value }] }));

  return (
    <Pressable
      accessibilityRole="switch"
      accessibilityState={{ checked: ligado }}
      onPress={() => {
        feedback.selecao();
        aoAlternar();
      }}
      style={[styles.trilho, { backgroundColor: ligado ? cores.lima : cores.borda }]}
    >
      <Animated.View style={[styles.botaoToggle, { backgroundColor: ligado ? cores.sobreCor : cores.textoSuave }, estiloBotao]} />
    </Pressable>
  );
}

/** Quadradinho escuro com a bandeira do idioma. */
export function TileBandeira({ bandeira, tamanho = 40 }: { bandeira: string; tamanho?: number }) {
  return (
    <View style={[styles.tile, { width: tamanho, height: tamanho, borderRadius: tamanho * 0.32 }]}>
      <Text style={{ fontSize: tamanho * 0.5 }}>{bandeira}</Text>
    </View>
  );
}

/** Botão secundário escuro (gradiente sutil + borda). */
export function BotaoSecundario({ rotulo, icone, aoPressionar, style }: { rotulo: string; icone?: string; aoPressionar: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={() => {
        feedback.toque();
        aoPressionar();
      }}
      style={({ pressed }) => [styles.secundario, pressed && { transform: [{ scale: 0.97 }] }, style]}
    >
      {icone ? <Icon source={icone} size={17} color={cores.texto} /> : null}
      <Text style={styles.secundarioTexto}>{rotulo}</Text>
    </Pressable>
  );
}

/** Botão lima compacto (altura 42, raio 13). */
export function BotaoLima({ rotulo, icone, aoPressionar, style }: { rotulo: string; icone?: string; aoPressionar: () => void; style?: StyleProp<ViewStyle> }) {
  return (
    <Pressable
      onPress={() => {
        feedback.toque();
        aoPressionar();
      }}
      style={({ pressed }) => [styles.lima, brilho(cores.lima), pressed && { transform: [{ scale: 0.97 }] }, style]}
    >
      {icone ? <Icon source={icone} size={18} color={cores.sobreCor} /> : null}
      <Text style={styles.limaTexto}>{rotulo}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  cartao: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, borderRadius: 22, flexShrink: 0 },
  rotuloSecao: { fontFamily: fontes.monoForte, fontSize: 10, letterSpacing: 0.8, textTransform: 'uppercase', color: cores.textoSuave },
  divisor: { height: 1, backgroundColor: cores.borda, marginHorizontal: 14 },
  linha: { paddingVertical: 13, paddingHorizontal: 14, flexDirection: 'row', alignItems: 'center', gap: 12 },
  cabecalho: { flexDirection: 'row', alignItems: 'flex-end', gap: 12, marginBottom: 2 },
  rotuloCabecalho: { fontFamily: fontes.mono, fontSize: 11, letterSpacing: 0.8, textTransform: 'uppercase', color: cores.textoSuave },
  titulo: { fontFamily: fontes.titulo, fontSize: 26, letterSpacing: -0.8, color: cores.texto },
  quadrado: { backgroundColor: cores.lima, alignItems: 'center', justifyContent: 'center' },
  chip: { height: 32, borderRadius: 11, paddingHorizontal: 13, justifyContent: 'center' },
  chipAtivo: { backgroundColor: cores.texto },
  chipInativo: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
  chipTexto: { fontFamily: fontes.negrito, fontSize: 14 },
  trilho: { width: 44, height: 26, borderRadius: 13, justifyContent: 'center' },
  botaoToggle: { width: 20, height: 20, borderRadius: 7 },
  tile: { backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center' },
  secundario: {
    height: 42,
    borderRadius: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#1E2032',
    borderWidth: 1,
    borderColor: cores.borda,
  },
  secundarioTexto: { fontFamily: fontes.negrito, fontSize: 15, color: cores.texto },
  lima: { height: 42, borderRadius: 13, paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: cores.lima },
  limaTexto: { fontFamily: fontes.titulo, fontSize: 16, color: cores.sobreCor },
});
