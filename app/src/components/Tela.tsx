import type { ReactNode } from 'react';
import { LinearGradient } from 'expo-linear-gradient';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores, degrades } from '@/theme';

type Props = {
  children: ReactNode;
  /** Telas de aba não têm cabeçalho nativo e precisam do espaço da barra de status. */
  semCabecalho?: boolean;
  atualizando?: boolean;
  aoAtualizar?: () => void;
};

export function Tela({ children, semCabecalho, atualizando = false, aoAtualizar }: Props) {
  const insets = useSafeAreaInsets();
  return (
    <View style={styles.tela}>
      {/* Brilho suave no topo, que dá profundidade ao fundo. */}
      <LinearGradient colors={degrades.brilhoFundo} style={styles.brilho} />
      <ScrollView
        style={styles.rolagem}
        contentContainerStyle={[
          styles.conteudo,
          { paddingTop: semCabecalho ? insets.top + 12 : 16, paddingBottom: insets.bottom + 110 },
        ]}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
        refreshControl={
          aoAtualizar ? <RefreshControl refreshing={atualizando} onRefresh={aoAtualizar} tintColor={cores.primaria} /> : undefined
        }
      >
        {children}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  rolagem: { flex: 1 },
  brilho: { position: 'absolute', top: 0, left: 0, right: 0, height: 340, pointerEvents: 'none' },
  conteudo: { paddingHorizontal: 16, gap: 14 },
});
