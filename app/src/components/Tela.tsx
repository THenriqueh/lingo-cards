import type { ReactNode } from 'react';
import { RefreshControl, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { cores } from '@/theme';

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
  conteudo: { paddingHorizontal: 16, gap: 14 },
});
