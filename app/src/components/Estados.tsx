import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Text } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { cores } from '@/theme';
import { Entrada } from './Entrada';
import { Lingo, type Humor } from './Lingo';

export function Carregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function Erro({ erro, aoTentarDeNovo }: { erro: unknown; aoTentarDeNovo: () => void }) {
  return (
    <Entrada style={styles.centro}>
      <Lingo humor="triste" tamanho={110} />
      <Text variant="titleMedium">Não foi possível carregar</Text>
      <Text style={styles.texto}>{mensagemDeErro(erro)}</Text>
      <Button mode="contained-tonal" onPress={aoTentarDeNovo}>
        Tentar de novo
      </Button>
    </Entrada>
  );
}

type VazioProps = { humor?: Humor; titulo: string; texto: string; acao?: { rotulo: string; aoPressionar: () => void; icone?: string } };

export function Vazio({ humor = 'pensando', titulo, texto, acao }: VazioProps) {
  return (
    <Entrada style={styles.centro}>
      <Lingo humor={humor} tamanho={120} />
      <Text variant="titleMedium">{titulo}</Text>
      <Text style={styles.texto}>{texto}</Text>
      {acao ? (
        <Button mode="contained" icon={acao.icone ?? 'plus'} onPress={acao.aoPressionar}>
          {acao.rotulo}
        </Button>
      ) : null}
    </Entrada>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 24, gap: 10 },
  texto: { color: cores.textoSuave, textAlign: 'center', marginBottom: 6 },
});
