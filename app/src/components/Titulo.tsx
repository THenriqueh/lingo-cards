import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { cores } from '@/theme';

export function Titulo({ titulo, subtitulo }: { titulo: string; subtitulo?: string }) {
  return (
    <View style={styles.container}>
      <Text variant="headlineMedium" style={styles.titulo}>
        {titulo}
      </Text>
      {subtitulo ? <Text style={styles.subtitulo}>{subtitulo}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 4, gap: 2 },
  titulo: { color: cores.texto, fontWeight: '800', letterSpacing: -0.5 },
  subtitulo: { color: cores.textoSuave, fontSize: 15 },
});
