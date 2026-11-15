import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import Animated, { SlideInDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, fontes } from '@/theme';
import { RotuloSecao } from './ui';

export type Acao = { rotulo: string; icone: string; aoPressionar: () => void; perigo?: boolean };

type Props = { visivel: boolean; rotulo: string; acoes: Acao[]; aoFechar: () => void };

/** Bottom sheet do menu "⋯": ações lado a lado; as destrutivas em coral. */
export function FolhaAcoes({ visivel, rotulo, acoes, aoFechar }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <Modal visible={visivel} transparent animationType="fade" onRequestClose={aoFechar}>
      <Pressable style={styles.fundo} onPress={aoFechar} accessibilityLabel="Fechar" />
      {visivel ? (
        <Animated.View entering={SlideInDown.duration(220)} style={[styles.folha, { paddingBottom: insets.bottom + 18 }]}>
          <View style={styles.alca} />
          <RotuloSecao>{rotulo}</RotuloSecao>
          <View style={styles.acoes}>
            {acoes.map((a) => (
              <Pressable
                key={a.rotulo}
                onPress={() => {
                  aoFechar();
                  a.aoPressionar();
                }}
                style={({ pressed }) => [styles.acao, pressed && { opacity: 0.7 }]}
              >
                <Icon source={a.icone} size={18} color={a.perigo ? cores.coral : cores.texto} />
                <Text style={[styles.acaoTexto, a.perigo && { color: cores.coral }]}>{a.rotulo}</Text>
              </Pressable>
            ))}
          </View>
        </Animated.View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  fundo: { ...StyleSheet.absoluteFill, backgroundColor: 'rgba(5,6,12,0.65)' },
  folha: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: cores.superficie,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    borderWidth: 1,
    borderColor: cores.borda,
    padding: 18,
    gap: 14,
  },
  alca: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: cores.borda, marginBottom: 4 },
  acoes: { flexDirection: 'row', gap: 10 },
  acao: {
    flex: 1,
    height: 52,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: cores.superficie2,
    borderWidth: 1,
    borderColor: cores.borda,
  },
  acaoTexto: { fontFamily: fontes.negrito, fontSize: 16, color: cores.texto },
});
