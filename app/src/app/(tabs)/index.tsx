import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useBaralhos, useEstatisticas } from '@/api/hooks';
import type { Baralho } from '@/api/tipos';
import { BotaoPrincipal } from '@/components/BotaoPrincipal';
import { CurvaSerrote } from '@/components/CurvaSerrote';
import { Entrada } from '@/components/Entrada';
import { Erro } from '@/components/Estados';
import { Lingo, type Humor } from '@/components/Lingo';
import { Tela } from '@/components/Tela';
import { Toque } from '@/components/Toque';
import { dataCurta, emQuantosDias, plural } from '@/lib/formato';
import { useAuth } from '@/store/auth';
import { brilho, cores, fontes, rotulo } from '@/theme';

function humorDoDesempenho(taxa: number | null | undefined): Humor {
  if (taxa == null) return 'feliz';
  return taxa >= 85 ? 'comemorando' : taxa >= 50 ? 'feliz' : 'pensando';
}

function Estatistica({ valor, legenda, destaque }: { valor: string; legenda: string; destaque?: boolean }) {
  return (
    <View style={styles.estatistica}>
      <Text style={[styles.estatisticaValor, destaque && { color: cores.lima }]}>{valor}</Text>
      <Text style={rotulo}>{legenda}</Text>
    </View>
  );
}

function LinhaBaralho({ baralho, aoPressionar }: { baralho: Baralho; aoPressionar: () => void }) {
  const pendentes = baralho.paraRevisar ?? 0;
  const total = baralho.totalCartoes ?? 0;
  const emDia = pendentes === 0;
  const codigo = (baralho.idioma?.codigo ?? '').toUpperCase();
  return (
    <Toque aoPressionar={aoPressionar}>
      <View style={[styles.baralho, emDia && styles.baralhoEmDia]}>
        <View style={styles.baralhoTopo}>
          <Text style={[styles.baralhoNome, emDia && { color: cores.textoSuave }]} numberOfLines={1}>
            <Text style={styles.codigo}>{codigo} </Text>
            {baralho.titulo} · {baralho.nivel}
          </Text>
          <Text style={[styles.quando, !emDia && { color: cores.lima }]}>
            {emDia ? emQuantosDias(baralho.proximaRevisao) || 'em dia' : `${pendentes} hoje`}
          </Text>
        </View>
        {!emDia ? (
          <View style={styles.trilho}>
            <View style={[styles.preenchido, { width: `${Math.min(100, (pendentes / Math.max(total, 1)) * 100)}%` }]} />
          </View>
        ) : null}
      </View>
    </Toque>
  );
}

export default function Painel() {
  const router = useRouter();
  const usuario = useAuth((s) => s.usuario);
  const estatisticas = useEstatisticas();
  const baralhos = useBaralhos();
  const [larguraCurva, setLarguraCurva] = useState(0);

  const recarregar = () => Promise.all([estatisticas.refetch(), baralhos.refetch()]);
  const e = estatisticas.data;
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';

  // Repetição espaçada: os baralhos com revisões vencidas vêm primeiro.
  const lista = (baralhos.data ?? [])
    .filter((b) => (b.totalCartoes ?? 0) > 0)
    .sort((a, b) => (b.paraRevisar ?? 0) - (a.paraRevisar ?? 0))
    .slice(0, 5);
  const proximo = lista.find((b) => (b.paraRevisar ?? 0) > 0);
  const pendentesHoje = e?.revisoesPendentes ?? 0;

  return (
    <Tela semCabecalho atualizando={estatisticas.isRefetching} aoAtualizar={recarregar}>
      <Entrada style={styles.topo}>
        <View style={{ flex: 1 }}>
          <Text style={rotulo}>{dataCurta()}</Text>
          <Text style={styles.ola}>Oi, {primeiroNome}</Text>
        </View>
        <Lingo humor={humorDoDesempenho(e?.taxaAcerto)} tamanho={40} />
      </Entrada>

      {estatisticas.isError ? (
        <Erro erro={estatisticas.error} aoTentarDeNovo={recarregar} />
      ) : (
        <>
          <Entrada indice={1}>
            <View style={styles.destaque} onLayout={(ev) => setLarguraCurva(ev.nativeEvent.layout.width - 32)}>
              <Text style={[rotulo, { color: cores.limaTinta }]}>Taxa de acerto</Text>
              <View style={styles.destaqueLinha}>
                <Text style={styles.destaqueValor}>{e?.taxaAcerto != null ? `${e.taxaAcerto}%` : '—'}</Text>
                <Text style={styles.destaqueTexto}>
                  {!e || e.totalCartoes === 0
                    ? 'Crie seus primeiros cartões'
                    : pendentesHoje > 0
                      ? `${plural(pendentesHoje, 'cartão vence', 'cartões vencem')} hoje`
                      : 'Revisões em dia'}
                </Text>
              </View>
              {larguraCurva > 0 ? <CurvaSerrote largura={larguraCurva} altura={52} /> : <View style={{ height: 52 }} />}
            </View>
          </Entrada>

          <Entrada indice={2} style={styles.grade}>
            <Estatistica valor={String(e?.totalCartoes ?? '–')} legenda="Cartões" />
            <Estatistica valor={String(e?.cartoesDominados ?? '–')} legenda="Dominados" />
            <Estatistica valor={String(e?.diasEstudados ?? '–')} legenda="Dias" destaque />
          </Entrada>
        </>
      )}

      <Entrada indice={3}>
        <Text style={[rotulo, { marginTop: 6 }]}>Para revisar hoje</Text>
      </Entrada>
      {lista.length === 0 ? (
        <Entrada indice={4}>
          <View style={styles.baralhoEmDia}>
            <Text style={{ color: cores.texto2 }}>
              Crie um idioma, depois um baralho com alguns cartões. O Lingo avisa aqui quando cada um precisa de revisão.
            </Text>
          </View>
        </Entrada>
      ) : (
        lista.map((b, i) => (
          <Entrada key={b.id} indice={i + 4}>
            <LinhaBaralho baralho={b} aoPressionar={() => router.push({ pathname: '/baralho/[id]', params: { id: b.id } })} />
          </Entrada>
        ))
      )}

      <Entrada indice={lista.length + 4} style={{ marginTop: 6 }}>
        {proximo ? (
          <BotaoPrincipal
            rotulo={`Revisar ${proximo.titulo} · ${proximo.paraRevisar}`}
            aoPressionar={() => router.push({ pathname: '/estudar/[id]', params: { id: proximo.id, modo: 'revisao' } })}
          />
        ) : lista.length === 0 ? (
          <BotaoPrincipal rotulo="Começar" aoPressionar={() => router.push('/idioma/editar')} />
        ) : null}
      </Entrada>
    </Tela>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  ola: { fontFamily: fontes.titulo, fontSize: 28, color: cores.texto, letterSpacing: -0.8, marginTop: 2 },
  destaque: { backgroundColor: cores.lima, borderRadius: 22, padding: 16, gap: 8, ...brilho(cores.lima) },
  destaqueLinha: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  destaqueValor: { fontFamily: fontes.titulo, fontSize: 46, color: cores.sobreCor, letterSpacing: -2 },
  destaqueTexto: { flex: 1, fontFamily: fontes.semi, fontSize: 15, color: cores.sobreCor },
  grade: { flexDirection: 'row', gap: 8 },
  estatistica: { flex: 1, backgroundColor: cores.superficie, borderRadius: 14, borderWidth: 1, borderColor: cores.bordaSuave, padding: 12, gap: 2 },
  estatisticaValor: { fontFamily: fontes.titulo, fontSize: 22, color: cores.texto },
  baralho: { backgroundColor: cores.superficie, borderRadius: 16, borderWidth: 1, borderColor: cores.borda, padding: 14, gap: 10 },
  baralhoEmDia: { backgroundColor: cores.superficie2, borderRadius: 16, borderWidth: 1, borderColor: cores.bordaSuave, padding: 14 },
  baralhoTopo: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  baralhoNome: { flex: 1, fontFamily: fontes.negrito, fontSize: 16, color: cores.texto },
  codigo: { fontFamily: fontes.monoForte, fontSize: 12, color: cores.texto2 },
  quando: { fontFamily: fontes.mono, fontSize: 12, color: cores.textoSuave },
  trilho: { height: 3, borderRadius: 2, backgroundColor: cores.bordaSuave, overflow: 'hidden' },
  preenchido: { height: 3, backgroundColor: cores.lima },
});
