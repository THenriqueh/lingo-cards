import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { IconButton, Text } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { useBaralhos, useExcluirIdioma, useIdiomas, useSalvarIdioma } from '@/api/hooks';
import type { Idioma } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Confirmacao } from '@/components/Confirmacao';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro } from '@/components/Estados';
import { FolhaAcoes } from '@/components/FolhaAcoes';
import { Tela } from '@/components/Tela';
import { CabecalhoTela, Linha, ListaGrupo, RotuloSecao, TileBandeira } from '@/components/ui';
import { bandeiraDe, SUGESTOES_IDIOMA } from '@/lib/bandeiras';
import { plural } from '@/lib/formato';
import { cores, fontes } from '@/theme';

export default function Idiomas() {
  const router = useRouter();
  const idiomas = useIdiomas();
  const baralhos = useBaralhos();
  const salvar = useSalvarIdioma();
  const excluir = useExcluirIdioma();
  const avisar = useAviso((s) => s.mostrar);
  const [menu, setMenu] = useState<Idioma | null>(null);
  const [aExcluir, setAExcluir] = useState<Idioma | null>(null);

  const cartoesDo = (idiomaId: number) =>
    (baralhos.data ?? []).filter((b) => b.idiomaId === idiomaId).reduce((soma, b) => soma + (b.totalCartoes ?? 0), 0);

  const existentes = new Set((idiomas.data ?? []).map((i) => i.codigo.toLowerCase()));
  const sugestoes = SUGESTOES_IDIOMA.filter((s) => !existentes.has(s.codigo));

  async function adicionar(s: (typeof SUGESTOES_IDIOMA)[number]) {
    try {
      await salvar.mutateAsync(s);
      avisar(`${s.nome} adicionado.`);
    } catch (e) {
      avisar(mensagemDeErro(e));
    }
  }

  async function confirmarExclusao() {
    if (!aExcluir) return;
    try {
      await excluir.mutateAsync(aExcluir.id);
      avisar(`${aExcluir.nome} excluído.`);
    } catch (e) {
      avisar(mensagemDeErro(e));
    } finally {
      setAExcluir(null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Tela semCabecalho atualizando={idiomas.isRefetching} aoAtualizar={() => Promise.all([idiomas.refetch(), baralhos.refetch()])}>
        <CabecalhoTela rotulo="O que você está aprendendo" titulo="Idiomas" />

        {idiomas.isPending ? (
          <Carregando />
        ) : idiomas.isError ? (
          <Erro erro={idiomas.error} aoTentarDeNovo={idiomas.refetch} />
        ) : idiomas.data.length > 0 ? (
          <Entrada>
            <ListaGrupo>
              {idiomas.data.map((i) => {
                const nBaralhos = i.totalBaralhos ?? 0;
                return (
                  <Linha key={i.id} aoPressionar={() => setMenu(i)}>
                    <TileBandeira bandeira={bandeiraDe(i)} tamanho={46} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.nome}>{i.nome}</Text>
                      <Text style={styles.info}>
                        {nBaralhos === 0
                          ? 'Nenhum baralho'
                          : `${plural(nBaralhos, 'baralho', 'baralhos')} · ${plural(cartoesDo(i.id), 'cartão', 'cartões')}`}
                      </Text>
                    </View>
                    <IconButton icon="dots-horizontal" iconColor={cores.textoSuave} size={22} onPress={() => setMenu(i)} accessibilityLabel={`Opções de ${i.nome}`} />
                  </Linha>
                );
              })}
            </ListaGrupo>
          </Entrada>
        ) : null}

        <Entrada indice={1} style={{ gap: 10, marginTop: 6 }}>
          <RotuloSecao>Adicionar idioma</RotuloSecao>
          <View style={styles.sugestoes}>
            {sugestoes.map((s) => (
              <Pressable key={s.codigo} style={styles.sugestao} onPress={() => adicionar(s)} disabled={salvar.isPending}>
                <Text style={styles.sugestaoTexto}>
                  {s.bandeira} {s.nome}
                </Text>
              </Pressable>
            ))}
            <Pressable style={[styles.sugestao, styles.outro]} onPress={() => router.push('/idioma/editar')}>
              <Text style={[styles.sugestaoTexto, { color: cores.lima }]}>+ Outro</Text>
            </Pressable>
          </View>
        </Entrada>
      </Tela>

      <FolhaAcoes
        visivel={!!menu}
        rotulo={`Editar · ${menu?.nome ?? ''}`}
        aoFechar={() => setMenu(null)}
        acoes={[
          { rotulo: 'Renomear', icone: 'pencil-outline', aoPressionar: () => menu && router.push({ pathname: '/idioma/editar', params: { id: menu.id } }) },
          { rotulo: 'Excluir', icone: 'trash-can-outline', perigo: true, aoPressionar: () => setAExcluir(menu) },
        ]}
      />
      <Confirmacao
        visivel={!!aExcluir}
        titulo={`Excluir ${aExcluir?.nome}?`}
        mensagem="Todos os baralhos, cartões e sessões deste idioma também serão excluídos."
        carregando={excluir.isPending}
        aoConfirmar={confirmarExclusao}
        aoCancelar={() => setAExcluir(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  nome: { fontFamily: fontes.titulo, fontSize: 17, color: cores.texto },
  info: { fontFamily: fontes.mono, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: cores.textoSuave },
  sugestoes: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  sugestao: { height: 38, borderRadius: 12, paddingHorizontal: 14, justifyContent: 'center', backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
  sugestaoTexto: { fontFamily: fontes.negrito, fontSize: 15, color: cores.texto },
  outro: { borderStyle: 'dashed', borderColor: cores.lima, backgroundColor: 'transparent' },
});
