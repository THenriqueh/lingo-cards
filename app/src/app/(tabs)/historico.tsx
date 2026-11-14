import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { useSessoes } from '@/api/hooks';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Tela } from '@/components/Tela';
import { Titulo } from '@/components/Titulo';
import { formatarData, formatarDuracao, percentual } from '@/lib/formato';
import { cores } from '@/theme';

function corDoDesempenho(p: number) {
  return p >= 80 ? cores.acerto : p >= 50 ? cores.destaque : cores.erro;
}

export default function Historico() {
  const router = useRouter();
  const sessoes = useSessoes();

  return (
    <Tela semCabecalho atualizando={sessoes.isRefetching} aoAtualizar={sessoes.refetch}>
      <Titulo titulo="Histórico" subtitulo="Suas sessões de estudo" />
      {sessoes.isPending ? (
        <Carregando />
      ) : sessoes.isError ? (
        <Erro erro={sessoes.error} aoTentarDeNovo={sessoes.refetch} />
      ) : sessoes.data.length === 0 ? (
        <Vazio icone="chart-bar" titulo="Nenhuma sessão ainda" texto="Estude um baralho e o resultado aparece aqui." />
      ) : (
        sessoes.data.map((s) => {
          const p = percentual(s.acertos, s.erros);
          return (
            <Card key={s.id} mode="contained" onPress={() => router.push({ pathname: '/sessao/[id]', params: { id: s.id } })}>
              <Card.Content style={styles.linha}>
                <View style={[styles.circulo, { borderColor: corDoDesempenho(p) }]}>
                  <Text style={[styles.percentual, { color: corDoDesempenho(p) }]}>{p}%</Text>
                </View>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    {s.baralho?.titulo ?? 'Baralho'}
                  </Text>
                  <Text style={{ color: cores.textoSuave }}>
                    ✓ {s.acertos}  ✗ {s.erros}  ·  {formatarDuracao(s.duracaoSegundos)}
                  </Text>
                  <Text style={{ color: cores.textoSuave, fontSize: 12 }}>{formatarData(s.realizadaEm)}</Text>
                </View>
              </Card.Content>
            </Card>
          );
        })
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  linha: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  circulo: { width: 58, height: 58, borderRadius: 29, borderWidth: 3, alignItems: 'center', justifyContent: 'center' },
  percentual: { fontWeight: '800', fontSize: 15 },
});
