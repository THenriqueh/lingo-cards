import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { cores, fontes, rotulo } from '@/theme';

/** Título de tela: rótulo em mono acima e o título em Bricolage. */
export function Titulo({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <View style={styles.container}>
      {subtitulo ? <Text style={rotulo}>{subtitulo}</Text> : null}
      <Text style={styles.titulo}>{titulo}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4, gap: 4 },
  titulo: { fontFamily: fontes.titulo, fontSize: 30, color: cores.texto, letterSpacing: -1 },
});
