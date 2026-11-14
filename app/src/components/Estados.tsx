import { StyleSheet, View } from 'react-native';
import { ActivityIndicator, Button, Icon, Text } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { cores } from '@/theme';

export function Carregando() {
  return (
    <View style={styles.centro}>
      <ActivityIndicator size="large" />
    </View>
  );
}

export function Erro({ erro, aoTentarDeNovo }: { erro: unknown; aoTentarDeNovo: () => void }) {
  return (
    <View style={styles.centro}>
      <Icon source="cloud-alert" size={44} color={cores.erro} />
      <Text variant="titleMedium">Não foi possível carregar</Text>
      <Text style={styles.texto}>{mensagemDeErro(erro)}</Text>
      <Button mode="contained-tonal" onPress={aoTentarDeNovo}>
        Tentar de novo
      </Button>
    </View>
  );
}

type VazioProps = { icone: string; titulo: string; texto: string; acao?: { rotulo: string; aoPressionar: () => void } };

export function Vazio({ icone, titulo, texto, acao }: VazioProps) {
  return (
    <View style={styles.centro}>
      <Icon source={icone} size={52} color={cores.primaria} />
      <Text variant="titleMedium">{titulo}</Text>
      <Text style={styles.texto}>{texto}</Text>
      {acao ? (
        <Button mode="contained" icon="plus" onPress={acao.aoPressionar}>
          {acao.rotulo}
        </Button>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  centro: { alignItems: 'center', justifyContent: 'center', paddingVertical: 56, paddingHorizontal: 24, gap: 10 },
  texto: { color: cores.textoSuave, textAlign: 'center', marginBottom: 6 },
});
