import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { cores, fontes } from '@/theme';

/** Selo com o código do idioma em mono ("DE", "EN"), no lugar da bandeira. */
export function CodigoIdioma({ codigo, tamanho = 42 }: { codigo?: string; tamanho?: number }) {
  return (
    <View style={[styles.selo, { width: tamanho, height: tamanho, borderRadius: tamanho * 0.3 }]}>
      <Text style={[styles.texto, { fontSize: tamanho * 0.32 }]}>{(codigo ?? '··').toUpperCase().slice(0, 3)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  selo: { backgroundColor: cores.superficie2, borderWidth: 1, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center' },
  texto: { fontFamily: fontes.monoForte, color: cores.lima, letterSpacing: 1 },
});
