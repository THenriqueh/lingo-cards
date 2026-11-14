import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Icon, ProgressBar, Text } from 'react-native-paper';
import { useBaralhos, useEstatisticas } from '@/api/hooks';
import { Erro } from '@/components/Estados';
import { Tela } from '@/components/Tela';
import { plural } from '@/lib/formato';
import { useAuth } from '@/store/auth';
import { cores } from '@/theme';

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

function Metrica({ icone, valor, rotulo, cor }: { icone: string; valor: string; rotulo: string; cor: string }) {
  return (
    <Card style={styles.metrica} mode="contained">
      <Card.Content style={{ gap: 4 }}>
        <Icon source={icone} size={22} color={cor} />
        <Text variant="headlineSmall" style={styles.metricaValor}>
          {valor}
        </Text>
        <Text style={styles.metricaRotulo}>{rotulo}</Text>
      </Card.Content>
    </Card>
  );
}

export default function Inicio() {
  const router = useRouter();
  const usuario = useAuth((s) => s.usuario);
  const estatisticas = useEstatisticas();
  const baralhos = useBaralhos();

  const recarregar = () => Promise.all([estatisticas.refetch(), baralhos.refetch()]);
  const e = estatisticas.data;
  const recentes = (baralhos.data ?? []).filter((b) => (b.totalCartoes ?? 0) > 0).slice(0, 3);
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  return (
    <Tela semCabecalho atualizando={estatisticas.isRefetching} aoAtualizar={recarregar}>
      <View style={styles.topo}>
        <Text style={styles.saudacao}>{saudacao()},</Text>
        <Text variant="headlineMedium" style={styles.nome}>
          {primeiroNome} 👋
        </Text>
      </View>

      {estatisticas.isError ? (
        <Erro erro={estatisticas.error} aoTentarDeNovo={recarregar} />
      ) : (
        <>
          <Card style={styles.destaque} mode="contained">
            <Card.Content style={{ gap: 10 }}>
              <Text style={styles.destaqueRotulo}>TAXA DE ACERTO</Text>
              <Text variant="displaySmall" style={styles.destaqueValor}>
                {e?.taxaAcerto != null ? `${e.taxaAcerto}%` : '—'}
              </Text>
              <ProgressBar progress={(e?.taxaAcerto ?? 0) / 100} color={cores.secundaria} style={styles.barra} />
              <Text style={styles.destaqueTexto}>
                {e && e.totalSessoes > 0
                  ? `Em ${plural(e.totalSessoes, 'sessão', 'sessões')} de estudo`
                  : 'Faça sua primeira sessão de estudo para ver seu desempenho.'}
              </Text>
            </Card.Content>
          </Card>

          <View style={styles.grade}>
            <Metrica icone="cards-outline" valor={String(e?.totalCartoes ?? '–')} rotulo="cartões" cor={cores.primaria} />
            <Metrica icone="calendar-check" valor={String(e?.diasEstudados ?? '–')} rotulo="dias de estudo" cor={cores.acerto} />
            <Metrica icone="timer-outline" valor={String(e?.minutosEstudados ?? '–')} rotulo="minutos" cor={cores.destaque} />
          </View>
        </>
      )}

      <Text variant="titleMedium" style={styles.secao}>
        Continue estudando
      </Text>
      {recentes.length === 0 ? (
        <Card mode="outlined">
          <Card.Content style={{ gap: 10 }}>
            <Text style={{ color: cores.textoSuave }}>
              Crie um idioma, depois um baralho com alguns cartões, e ele aparece aqui.
            </Text>
            <Button mode="contained-tonal" icon="plus" onPress={() => router.push('/idioma/editar')}>
              Começar
            </Button>
          </Card.Content>
        </Card>
      ) : (
        recentes.map((b) => (
          <Card key={b.id} mode="contained" onPress={() => router.push({ pathname: '/baralho/[id]', params: { id: b.id } })}>
            <Card.Title
              title={b.titulo}
              titleStyle={{ fontWeight: '700' }}
              subtitle={`${b.idioma?.bandeira ?? ''} ${b.idioma?.nome ?? ''} · ${plural(b.totalCartoes ?? 0, 'cartão', 'cartões')}`}
              right={() => (
                <Button
                  mode="contained"
                  compact
                  icon="play"
                  style={{ marginRight: 12 }}
                  onPress={() => router.push({ pathname: '/estudar/[id]', params: { id: b.id } })}
                >
                  Estudar
                </Button>
              )}
            />
          </Card>
        ))
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  topo: { marginBottom: 4 },
  saudacao: { color: cores.textoSuave, fontSize: 16 },
  nome: { color: cores.texto, fontWeight: '800' },
  destaque: { backgroundColor: cores.primaria },
  destaqueRotulo: { color: '#1B1440', fontWeight: '800', letterSpacing: 1, fontSize: 12 },
  destaqueValor: { color: '#14102E', fontWeight: '800' },
  destaqueTexto: { color: '#251C57' },
  barra: { height: 8, borderRadius: 4, backgroundColor: 'rgba(20,16,46,0.25)' },
  grade: { flexDirection: 'row', gap: 10 },
  metrica: { flex: 1 },
  metricaValor: { color: cores.texto, fontWeight: '800' },
  metricaRotulo: { color: cores.textoSuave, fontSize: 12 },
  secao: { color: cores.texto, fontWeight: '700', marginTop: 8 },
});
