import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Icon, ProgressBar, Text } from 'react-native-paper';
import { useBaralhos, useEstatisticas } from '@/api/hooks';
import { Entrada } from '@/components/Entrada';
import { Erro } from '@/components/Estados';
import { Lingo, type Humor } from '@/components/Lingo';
import { Tela } from '@/components/Tela';
import { Toque } from '@/components/Toque';
import { plural } from '@/lib/formato';
import { useAuth } from '@/store/auth';
import { brilho, cartaoProfundo, cores, degrades } from '@/theme';

function saudacao() {
  const h = new Date().getHours();
  return h < 12 ? 'Bom dia' : h < 18 ? 'Boa tarde' : 'Boa noite';
}

function humorDoDesempenho(taxa: number | null | undefined): Humor {
  if (taxa == null) return 'feliz';
  return taxa >= 80 ? 'comemorando' : taxa >= 50 ? 'feliz' : 'pensando';
}

function Metrica({ icone, valor, rotulo, cor }: { icone: string; valor: string; rotulo: string; cor: string }) {
  return (
    <Card style={[styles.metrica, cartaoProfundo]} mode="contained">
      <Card.Content style={{ gap: 4 }}>
        <View style={[styles.metricaIcone, { backgroundColor: `${cor}22` }]}>
          <Icon source={icone} size={20} color={cor} />
        </View>
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
  // Primeiro os baralhos com revisões vencidas (repetição espaçada).
  const recentes = (baralhos.data ?? [])
    .filter((b) => (b.totalCartoes ?? 0) > 0)
    .sort((a, b) => (b.paraRevisar ?? 0) - (a.paraRevisar ?? 0))
    .slice(0, 3);
  const pendentesHoje = e?.revisoesPendentes ?? 0;
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  return (
    <Tela semCabecalho atualizando={estatisticas.isRefetching} aoAtualizar={recarregar}>
      <Entrada style={styles.topo}>
        <Text style={styles.saudacao}>{saudacao()},</Text>
        <Text variant="headlineMedium" style={styles.nome}>
          {primeiroNome} 👋
        </Text>
      </Entrada>

      {estatisticas.isError ? (
        <Erro erro={estatisticas.error} aoTentarDeNovo={recarregar} />
      ) : (
        <>
          <Entrada indice={1}>
            <LinearGradient colors={degrades.primaria} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.destaque}>
              <View style={styles.destaqueTopo}>
                <View style={{ flex: 1, gap: 6 }}>
                  <Text style={styles.destaqueRotulo}>TAXA DE ACERTO</Text>
                  <Text variant="displaySmall" style={styles.destaqueValor}>
                    {e?.taxaAcerto != null ? `${e.taxaAcerto}%` : '—'}
                  </Text>
                </View>
                <Lingo humor={humorDoDesempenho(e?.taxaAcerto)} tamanho={92} />
              </View>
              <ProgressBar progress={(e?.taxaAcerto ?? 0) / 100} color="#FFFFFF" style={styles.barra} />
              <Text style={styles.destaqueTexto}>
                {e && e.totalSessoes > 0
                  ? `Em ${plural(e.totalSessoes, 'sessão', 'sessões')} · ${e.minutosEstudados} min de estudo`
                  : 'Faça sua primeira sessão de estudo para ver seu desempenho.'}
              </Text>
              {e && e.totalCartoes > 0 ? (
                <View style={styles.revisoes}>
                  <Icon source={pendentesHoje > 0 ? 'calendar-refresh' : 'check-circle'} size={18} color="#FFFFFF" />
                  <Text style={styles.revisoesTexto}>
                    {pendentesHoje > 0
                      ? `${plural(pendentesHoje, 'cartão', 'cartões')} para revisar hoje`
                      : 'Revisões em dia!'}
                  </Text>
                </View>
              ) : null}
            </LinearGradient>
          </Entrada>

          <Entrada indice={2} style={styles.grade}>
            <Metrica icone="cards-outline" valor={String(e?.totalCartoes ?? '–')} rotulo="cartões" cor={cores.primaria} />
            <Metrica icone="calendar-check" valor={String(e?.diasEstudados ?? '–')} rotulo="dias de estudo" cor={cores.acerto} />
            <Metrica icone="star-circle-outline" valor={String(e?.cartoesDominados ?? '–')} rotulo="dominados" cor={cores.destaque} />
          </Entrada>
        </>
      )}

      <Entrada indice={3}>
        <Text variant="titleMedium" style={styles.secao}>
          Continue estudando
        </Text>
      </Entrada>
      {recentes.length === 0 ? (
        <Entrada indice={4}>
          <Card mode="contained" style={cartaoProfundo}>
            <Card.Content style={{ gap: 10 }}>
              <Text style={{ color: cores.textoSuave }}>
                Crie um idioma, depois um baralho com alguns cartões, e ele aparece aqui.
              </Text>
              <Button mode="contained-tonal" icon="plus" onPress={() => router.push('/idioma/editar')}>
                Começar
              </Button>
            </Card.Content>
          </Card>
        </Entrada>
      ) : (
        recentes.map((b, indice) => (
          <Entrada key={b.id} indice={indice + 4}>
            <Toque aoPressionar={() => router.push({ pathname: '/baralho/[id]', params: { id: b.id } })}>
              <Card mode="contained" style={cartaoProfundo}>
                <Card.Title
                  title={b.titulo}
                  titleStyle={{ fontWeight: '700' }}
                  subtitle={
                    (b.paraRevisar ?? 0) > 0
                      ? `${b.idioma?.bandeira ?? ''} ${plural(b.paraRevisar ?? 0, 'cartão', 'cartões')} para revisar`
                      : `${b.idioma?.bandeira ?? ''} ${b.idioma?.nome ?? ''} · em dia`
                  }
                  right={() => {
                    const revisar = (b.paraRevisar ?? 0) > 0;
                    return (
                      <Button
                        mode={revisar ? 'contained' : 'contained-tonal'}
                        compact
                        icon={revisar ? 'calendar-refresh' : 'play'}
                        style={{ marginRight: 12 }}
                        onPress={() =>
                          router.push({ pathname: '/estudar/[id]', params: { id: b.id, modo: revisar ? 'revisao' : 'todos' } })
                        }
                      >
                        {revisar ? 'Revisar' : 'Estudar'}
                      </Button>
                    );
                  }}
                />
              </Card>
            </Toque>
          </Entrada>
        ))
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  topo: { marginBottom: 4 },
  saudacao: { color: cores.textoSuave, fontSize: 16 },
  nome: { color: cores.texto, fontWeight: '800' },
  destaque: { borderRadius: 24, padding: 20, gap: 12, ...brilho(cores.primaria) },
  destaqueTopo: { flexDirection: 'row', alignItems: 'center' },
  destaqueRotulo: { color: 'rgba(255,255,255,0.8)', fontWeight: '800', letterSpacing: 1, fontSize: 12 },
  destaqueValor: { color: '#FFFFFF', fontWeight: '800' },
  destaqueTexto: { color: 'rgba(255,255,255,0.85)' },
  barra: { height: 8, borderRadius: 4, backgroundColor: 'rgba(255,255,255,0.25)' },
  revisoes: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(20,16,46,0.28)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 999,
  },
  revisoesTexto: { color: '#FFFFFF', fontWeight: '700' },
  grade: { flexDirection: 'row', gap: 10 },
  metrica: { flex: 1 },
  metricaIcone: { width: 34, height: 34, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  metricaValor: { color: cores.texto, fontWeight: '800' },
  metricaRotulo: { color: cores.textoSuave, fontSize: 12 },
  secao: { color: cores.texto, fontWeight: '700', marginTop: 8 },
});
