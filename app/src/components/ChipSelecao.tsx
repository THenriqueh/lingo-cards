import type { ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { Chip } from 'react-native-paper';
import { feedback } from '@/lib/feedback';
import { cores } from '@/theme';

type Props = {
  selecionado: boolean;
  aoPressionar: () => void;
  children: ReactNode;
};

/** Chip de seleção: a opção escolhida fica destacada com a cor principal. */
export function ChipSelecao({ selecionado, aoPressionar, children }: Props) {
  return (
    <Chip
      mode={selecionado ? 'flat' : 'outlined'}
      selected={selecionado}
      showSelectedCheck={false}
      onPress={() => {
        feedback.selecao();
        aoPressionar();
      }}
      style={[styles.chip, selecionado && styles.selecionado]}
      textStyle={[styles.texto, selecionado && styles.textoSelecionado]}
    >
      {children}
    </Chip>
  );
}

const styles = StyleSheet.create({
  chip: { borderColor: cores.borda, backgroundColor: 'transparent' },
  selecionado: { backgroundColor: cores.primaria, borderColor: cores.primaria },
  texto: { color: cores.textoSuave },
  textoSelecionado: { color: '#14102E', fontWeight: '700' },
});
