import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import Svg, { Circle } from 'react-native-svg';
import { mensagemDeErro } from '@/api/client';
import { useBaralhos, useExcluirSessao, useSessoes } from '@/api/hooks';
import type { Sessao } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Confirmacao } from '@/components/Confirmacao';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { FolhaAcoes } from '@/components/FolhaAcoes';
import { Tela } from '@/components/Tela';
import { CabecalhoTela, Cartao, Linha, ListaGrupo, RotuloSecao } from '@/components/ui';
import { bandeiraDe } from '@/lib/bandeiras';
import { chaveDoDia, diasDaSemana, duracaoCurta, hora, INICIAIS_DIAS, percentual, plural, rotuloDoDia } from '@/lib/formato';
import { cores, fontes } from '@/theme';

/** Anel pequeno (36px) com a % de acerto da sessão. */
function AnelSessao({ p }: { p: number }) {
  const r = 15;
  const c = 2 * Math.PI * r;
  const cor = p >= 50 ? cores.lima : cores.coral;
  return (
    <View style={styles.anel}>
      <Svg width={36} height={36} style={{ transform: [{ rotate: '-90deg' }] }}>
        <Circle cx={18} cy={18} r={r} stroke={cores.borda} strokeWidth={3.5} fill="none" />
        <Circle cx={18} cy={18} r={r} stroke={cor} strokeWidth={3.5} fill="none" strokeLinecap="round" strokeDasharray={`${c} ${c}`} strokeDashoffset={c * (1 - p / 100)} />
      </Svg>
      <Text style={[styles.anelTexto, { color: cor }]}>{p}%</Text>
    </View>
  );
}

export default function Historico() {
  const router = useRouter();
  const sessoes = useSessoes();
  const baralhos = useBaralhos();
  const excluir = useExcluirSessao();
  const avisar = useAviso((s) => s.mostrar);
  const [menu, setMenu] = useState<Sessao | null>(null);
  const [aExcluir, setAExcluir] = useState<Sessao | null>(null);

  const lista = sessoes.data ?? [];
  const bandeiraDoBaralho = (id: number) => bandeiraDe(baralhos.data?.find((b) => b.id === id)?.idioma);

  // Resumo da semana (domingo a sábado).
  const semana = diasDaSemana();
  const chavesSemana = new Set(semana.map(chaveDoDia));
  const daSemana = lista.filter((s) => chavesSemana.has(chaveDoDia(new Date(s.realizadaEm))));
  const acertos = daSemana.reduce((t, s) => t + s.acertos, 0);
  const erros = daSemana.reduce((t, s) => t + s.erros, 0);
  const segundos = daSemana.reduce((t, s) => t + s.duracaoSegundos, 0);
  const porDia = semana.map((d) => daSemana.filter((s) => chaveDoDia(new Date(s.realizadaEm)) === chaveDoDia(d)).reduce((t, s) => t + s.duracaoSegundos, 0));
  const maior = Math.max(1, ...porDia);
  const hoje = chaveDoDia(new Date());

  // Sessões agrupadas por dia.
  const grupos: { rotulo: string; itens: Sessao[] }[] = [];
  for (const s of lista) {
    const rotulo = rotuloDoDia(s.realizadaEm);
    const ultimo = grupos[grupos.length - 1];
    if (ultimo?.rotulo === rotulo) ultimo.itens.push(s);
    else grupos.push({ rotulo, itens: [s] });
  }

  async function confirmarExclusao() {
    if (!aExcluir) return;
    try {
      await excluir.mutateAsync(aExcluir.id);
      avisar('Sessão excluída.');
    } catch (e) {
      avisar(mensagemDeErro(e));
    } finally {
      setAExcluir(null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Tela semCabecalho atualizando={sessoes.isRefetching} aoAtualizar={sessoes.refetch}>
        <CabecalhoTela rotulo="Suas sessões de estudo" titulo="Histórico" />

        {sessoes.isPending ? (
          <Carregando />
        ) : sessoes.isError ? (
          <Erro erro={sessoes.error} aoTentarDeNovo={sessoes.refetch} />
        ) : lista.length === 0 ? (
          <Vazio titulo="Nenhuma sessão ainda" texto="Estude um baralho e o resultado aparece aqui." />
        ) : (
          <>
            <Entrada>
              <Cartao style={styles.resumo}>
                <View style={styles.resumoTopo}>
                  <View style={{ flex: 1, gap: 4 }}>
                    <RotuloSecao>Esta semana</RotuloSecao>
                    <Text style={styles.porcentagem}>
                      {percentual(acertos, erros)}%<Text style={styles.deAcerto}> de acerto</Text>
                    </Text>
                  </View>
                  <View style={{ alignItems: 'flex-end', gap: 4 }}>
                    <Text style={styles.resumoMono}>
                      <Text style={styles.resumoNumero}>{daSemana.length}</Text> {daSemana.length === 1 ? 'sessão' : 'sessões'}
                    </Text>
                    <Text style={styles.resumoMono}>
                      <Text style={styles.resumoNumero}>{duracaoCurta(segundos)}</Text> estudados
                    </Text>
                  </View>
                </View>
                <View style={styles.grafico}>
                  {porDia.map((seg, i) => {
                    const ehHoje = chaveDoDia(semana[i]) === hoje;
                    return (
                      <View key={i} style={styles.coluna}>
                        <View style={styles.colunaArea}>
                          <View style={[styles.barra, seg > 0 ? { height: Math.max(8, (seg / maior) * 42), backgroundColor: cores.lima } : null]} />
                        </View>
                        <Text style={[styles.diaLetra, ehHoje && { color: cores.lima }]}>{INICIAIS_DIAS[i]}</Text>
                      </View>
                    );
                  })}
                </View>
              </Cartao>
            </Entrada>

            {grupos.map((g, gi) => (
              <Entrada key={g.rotulo} indice={gi + 1} style={{ gap: 10 }}>
                <RotuloSecao style={{ marginTop: 6 }}>{g.rotulo}</RotuloSecao>
                <ListaGrupo>
                  {g.itens.map((s) => (
                    <Linha
                      key={s.id}
                      aoPressionar={() => router.push({ pathname: '/sessao/[id]', params: { id: s.id } })}
                      aoSegurar={() => setMenu(s)}
                    >
                      <AnelSessao p={percentual(s.acertos, s.erros)} />
                      <View style={{ flex: 1, gap: 3 }}>
                        <Text style={styles.sessaoTitulo} numberOfLines={1}>
                          {bandeiraDoBaralho(s.baralhoId)} {s.baralho?.titulo ?? 'Baralho'}
                        </Text>
                        <Text style={styles.sessaoInfo}>
                          ✓{s.acertos} ✕{s.erros} · {duracaoCurta(s.duracaoSegundos)}
                        </Text>
                      </View>
                      <Text style={styles.hora}>{hora(s.realizadaEm)}</Text>
                    </Linha>
                  ))}
                </ListaGrupo>
              </Entrada>
            ))}
            <Text style={styles.dica}>Segure uma sessão para editar ou excluir · {plural(lista.length, 'sessão', 'sessões')}</Text>
          </>
        )}
      </Tela>

      <FolhaAcoes
        visivel={!!menu}
        rotulo={`Sessão · ${menu?.baralho?.titulo ?? ''}`}
        aoFechar={() => setMenu(null)}
        acoes={[
          { rotulo: 'Editar', icone: 'pencil-outline', aoPressionar: () => menu && router.push({ pathname: '/sessao/[id]', params: { id: menu.id } }) },
          { rotulo: 'Excluir', icone: 'trash-can-outline', perigo: true, aoPressionar: () => setAExcluir(menu) },
        ]}
      />
      <Confirmacao
        visivel={!!aExcluir}
        titulo="Excluir sessão?"
        mensagem="Ela some do histórico e das estatísticas."
        carregando={excluir.isPending}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setAExcluir(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  resumo: { padding: 16, gap: 14 },
  resumoTopo: { flexDirection: 'row', alignItems: 'flex-start' },
  porcentagem: { fontFamily: fontes.titulo, fontSize: 30, letterSpacing: -1, color: cores.texto },
  deAcerto: { fontFamily: fontes.semi, fontSize: 15, letterSpacing: 0, color: cores.texto2 },
  resumoMono: { fontFamily: fontes.mono, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: cores.textoSuave },
  resumoNumero: { fontFamily: fontes.monoForte, fontSize: 12, color: cores.texto },
  grafico: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  coluna: { alignItems: 'center', gap: 8 },
  colunaArea: { height: 42, justifyContent: 'flex-end' },
  barra: { width: 22, height: 4, borderRadius: 6, backgroundColor: cores.borda },
  diaLetra: { fontFamily: fontes.mono, fontSize: 10, color: cores.textoSuave },
  anel: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  anelTexto: { position: 'absolute', fontFamily: fontes.monoForte, fontSize: 9 },
  sessaoTitulo: { fontFamily: fontes.semi, fontSize: 13, color: cores.texto },
  sessaoInfo: { fontFamily: fontes.mono, fontSize: 10, color: cores.textoSuave },
  hora: { fontFamily: fontes.mono, fontSize: 11, color: '#5E6178' },
  dica: { fontFamily: fontes.mono, fontSize: 10, color: '#5E6178', textAlign: 'center', marginTop: 4 },
});
