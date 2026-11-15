import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useBaralhos, useEstatisticas, useSessoes } from '@/api/hooks';
import { CurvaSerrote } from '@/components/CurvaSerrote';
import { Entrada } from '@/components/Entrada';
import { Erro } from '@/components/Estados';
import { Lingo } from '@/components/Lingo';
import { Tela } from '@/components/Tela';
import { Cartao, RotuloSecao, TileBandeira } from '@/components/ui';
import { bandeiraDe } from '@/lib/bandeiras';
import { feedback } from '@/lib/feedback';
import { chaveDoDia, dataCurta, diasDaSemana, emQuantosDias, INICIAIS_DIAS, plural, sequenciaDeDias } from '@/lib/formato';
import { useAuth } from '@/store/auth';
import { cores, fontes } from '@/theme';

export default function Inicio() {
  const router = useRouter();
  const usuario = useAuth((s) => s.usuario);
  const estatisticas = useEstatisticas();
  const baralhos = useBaralhos();
  const sessoes = useSessoes();
  const [larguraCurva, setLarguraCurva] = useState(0);

  const recarregar = () => Promise.all([estatisticas.refetch(), baralhos.refetch(), sessoes.refetch()]);
  const e = estatisticas.data;
  const primeiroNome = usuario?.nome.split(' ')[0] ?? '';
  const inicial = (usuario?.nome ?? '?').charAt(0).toUpperCase();

  // Repetição espaçada: o baralho com mais cartões vencidos e quando vence a próxima revisão.
  const comCartoes = (baralhos.data ?? []).filter((b) => (b.totalCartoes ?? 0) > 0);
  const maisUrgente = [...comCartoes].sort((a, b) => (b.paraRevisar ?? 0) - (a.paraRevisar ?? 0))[0];
  const pendentes = e?.revisoesPendentes ?? 0;
  const proxima = comCartoes
    .map((b) => b.proximaRevisao)
    .filter((d): d is string => !!d)
    .sort()[0];

  // Sequência semanal a partir das sessões.
  const diasEstudados = new Set((sessoes.data ?? []).map((s) => chaveDoDia(new Date(s.realizadaEm))));
  const sequencia = sequenciaDeDias(diasEstudados);
  const semana = diasDaSemana();

  // Continuar: o último baralho estudado (ou o mais recente com cartões).
  const ultimoEstudado = (sessoes.data ?? [])[0]?.baralhoId;
  const continuar = comCartoes.find((b) => b.id === ultimoEstudado) ?? comCartoes[0];

  const estudar = (id: number, modo: 'revisao' | 'todos') => router.push({ pathname: '/estudar/[id]', params: { id, modo } });

  let hero: { rotulo: string; titulo: string; rodapeEsq: string; acao: string; aoPressionar: () => void; humor: 'feliz' | 'comemorando' };
  if (comCartoes.length === 0) {
    hero = {
      rotulo: 'Comece por aqui',
      titulo: 'Crie seu primeiro\nbaralho.',
      rodapeEsq: 'Leva 1 minuto',
      acao: 'Começar',
      humor: 'feliz',
      aoPressionar: () => router.push('/idioma/editar'),
    };
  } else if (pendentes > 0 && maisUrgente) {
    hero = {
      rotulo: 'Para revisar hoje',
      titulo: plural(pendentes, 'cartão', 'cartões'),
      rodapeEsq: `${maisUrgente.paraRevisar} em ${maisUrgente.idioma?.nome ?? maisUrgente.titulo}`,
      acao: 'Revisar',
      humor: 'feliz',
      aoPressionar: () => estudar(maisUrgente.id, 'revisao'),
    };
  } else {
    hero = {
      rotulo: 'Tudo revisado',
      titulo: 'Sua memória\nestá em dia.',
      rodapeEsq: `Próxima: ${emQuantosDias(proxima) || 'em breve'}`,
      acao: 'Adiantar',
      humor: 'comemorando',
      aoPressionar: () => maisUrgente && estudar(maisUrgente.id, 'todos'),
    };
  }

  return (
    <Tela semCabecalho gap={10} atualizando={estatisticas.isRefetching} aoAtualizar={recarregar}>
      <Entrada style={styles.topo}>
        <View style={{ flex: 1 }}>
          <Text style={styles.data}>{dataCurta()}</Text>
          <Text style={styles.ola}>Oi, {primeiroNome}</Text>
        </View>
        <Pressable style={styles.avatar} onPress={() => router.push('/conta')} accessibilityLabel="Conta">
          <Text style={styles.avatarLetra}>{inicial}</Text>
        </Pressable>
      </Entrada>

      {estatisticas.isError ? <Erro erro={estatisticas.error} aoTentarDeNovo={recarregar} /> : null}

      <Entrada indice={1}>
        <Pressable onPress={hero.aoPressionar} style={styles.hero} onLayout={(ev) => setLarguraCurva(ev.nativeEvent.layout.width - 36)}>
          <View style={styles.heroTopo}>
            <View style={{ flex: 1, gap: 4 }}>
              <RotuloSecao cor={cores.limaTinta}>{hero.rotulo}</RotuloSecao>
              <Text style={styles.heroTitulo}>{hero.titulo}</Text>
            </View>
            <Lingo humor={hero.humor} tamanho={44} invertido />
          </View>
          {larguraCurva > 0 ? (
            <CurvaSerrote largura={larguraCurva} altura={44} espessura={2.5} />
          ) : (
            <View style={{ height: 44 }} />
          )}
          <View style={styles.heroRodape}>
            <Text style={styles.heroRodapeTexto} numberOfLines={1}>
              {hero.rodapeEsq.toUpperCase()}
            </Text>
            <Text style={styles.heroAcao}>{hero.acao} →</Text>
          </View>
        </Pressable>
      </Entrada>

      <Entrada indice={2}>
        <Cartao style={styles.stats}>
          {[
            { valor: e?.taxaAcerto != null ? `${e.taxaAcerto}%` : '—', legenda: 'Acerto', cor: cores.lima },
            { valor: String(e?.totalCartoes ?? '–'), legenda: 'Cartões' },
            { valor: String(e?.cartoesDominados ?? '–'), legenda: 'Dominados' },
            { valor: String(e?.diasEstudados ?? '–'), legenda: 'Dias' },
          ].map((s, i) => (
            <View key={s.legenda} style={[styles.stat, i > 0 && styles.statBorda]}>
              <Text style={[styles.statValor, s.cor ? { color: s.cor } : null]}>{s.valor}</Text>
              <Text style={styles.statLegenda}>{s.legenda}</Text>
            </View>
          ))}
        </Cartao>
      </Entrada>

      <Entrada indice={3}>
        <Cartao style={styles.sequencia}>
          <View style={styles.linhaEntre}>
            <RotuloSecao>Sequência</RotuloSecao>
            <RotuloSecao cor={cores.lima}>{sequencia === 1 ? '1 dia' : `${sequencia} dias`}</RotuloSecao>
          </View>
          <View style={styles.semana}>
            {semana.map((dia, i) => {
              const estudou = diasEstudados.has(chaveDoDia(dia));
              const hoje = chaveDoDia(dia) === chaveDoDia(new Date());
              return (
                <View key={i} style={styles.diaColuna}>
                  <View style={[styles.dia, estudou ? styles.diaFeito : styles.diaVazio]}>
                    {estudou ? <Icon source="check-bold" size={16} color={cores.sobreCor} /> : null}
                  </View>
                  <Text style={[styles.diaLetra, hoje && { color: cores.lima }]}>{INICIAIS_DIAS[i]}</Text>
                </View>
              );
            })}
          </View>
        </Cartao>
      </Entrada>

      {continuar ? (
        <Entrada indice={4} style={{ gap: 10, marginTop: 4 }}>
          <RotuloSecao>Continuar estudando</RotuloSecao>
          <Pressable onPress={() => router.push({ pathname: '/baralho/[id]', params: { id: continuar.id } })}>
            <Cartao style={styles.continuar}>
              <TileBandeira bandeira={bandeiraDe(continuar.idioma)} />
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.continuarTitulo} numberOfLines={1}>
                  {continuar.titulo}
                </Text>
                <Text style={styles.continuarInfo}>
                  {continuar.nivel} · {plural(continuar.totalCartoes ?? 0, 'cartão', 'cartões').toUpperCase()}
                </Text>
              </View>
              <Pressable
                style={styles.play}
                accessibilityLabel="Estudar"
                onPress={() => {
                  feedback.toque();
                  estudar(continuar.id, (continuar.paraRevisar ?? 0) > 0 ? 'revisao' : 'todos');
                }}
              >
                <Icon source="play" size={22} color={cores.sobreCor} />
              </Pressable>
            </Cartao>
          </Pressable>
        </Entrada>
      ) : null}
    </Tela>
  );
}

const styles = StyleSheet.create({
  topo: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  data: { fontFamily: fontes.mono, fontSize: 11, letterSpacing: 0.8, color: cores.textoSuave },
  ola: { fontFamily: fontes.titulo, fontSize: 28, color: cores.texto, letterSpacing: -0.9, marginTop: 2 },
  avatar: { width: 40, height: 40, borderRadius: 14, backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda, alignItems: 'center', justifyContent: 'center' },
  avatarLetra: { fontFamily: fontes.titulo, fontSize: 17, color: cores.lima },
  hero: {
    backgroundColor: cores.lima,
    borderRadius: 22,
    padding: 18,
    paddingBottom: 14,
    gap: 6,
    shadowColor: cores.lima,
    shadowOpacity: 0.55,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 18 },
    elevation: 8,
  },
  heroTopo: { flexDirection: 'row', alignItems: 'flex-start', gap: 12 },
  heroTitulo: { fontFamily: fontes.titulo, fontSize: 22, lineHeight: 24, letterSpacing: -0.6, color: cores.sobreCor },
  heroRodape: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(11,12,20,0.15)',
    paddingTop: 12,
    marginTop: 4,
    gap: 12,
  },
  heroRodapeTexto: { flex: 1, fontFamily: fontes.monoForte, fontSize: 11, letterSpacing: 0.8, color: cores.sobreCor },
  heroAcao: { fontFamily: fontes.titulo, fontSize: 15, color: cores.sobreCor },
  stats: { flexDirection: 'row', paddingVertical: 14 },
  stat: { flex: 1, alignItems: 'center', gap: 4 },
  statBorda: { borderLeftWidth: 1, borderLeftColor: cores.borda },
  statValor: { fontFamily: fontes.titulo, fontSize: 19, color: cores.texto },
  statLegenda: { fontFamily: fontes.mono, fontSize: 8.5, letterSpacing: 0.8, textTransform: 'uppercase', color: cores.textoSuave },
  sequencia: { padding: 16, gap: 14 },
  linhaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  semana: { flexDirection: 'row', justifyContent: 'space-between' },
  diaColuna: { alignItems: 'center', gap: 8 },
  dia: { width: 30, height: 30, borderRadius: 9, alignItems: 'center', justifyContent: 'center' },
  diaFeito: { backgroundColor: cores.lima },
  diaVazio: { borderWidth: 1.5, borderColor: cores.borda },
  diaLetra: { fontFamily: fontes.mono, fontSize: 10, color: cores.textoSuave },
  continuar: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, borderRadius: 18 },
  continuarTitulo: { fontFamily: fontes.titulo, fontSize: 16, color: cores.texto },
  continuarInfo: { fontFamily: fontes.mono, fontSize: 10, letterSpacing: 0.8, color: cores.textoSuave },
  play: { width: 38, height: 38, borderRadius: 12, backgroundColor: cores.lima, alignItems: 'center', justifyContent: 'center' },
});
