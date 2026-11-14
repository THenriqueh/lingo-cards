import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, FAB, IconButton, Text } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { useExcluirIdioma, useIdiomas } from '@/api/hooks';
import type { Idioma } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Confirmacao } from '@/components/Confirmacao';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { CodigoIdioma } from '@/components/CodigoIdioma';
import { Tela } from '@/components/Tela';
import { Titulo } from '@/components/Titulo';
import { plural } from '@/lib/formato';
import { brilho, cartaoProfundo, cores, fontes } from '@/theme';

export default function Idiomas() {
  const router = useRouter();
  const idiomas = useIdiomas();
  const excluir = useExcluirIdioma();
  const avisar = useAviso((s) => s.mostrar);
  const [aExcluir, setAExcluir] = useState<Idioma | null>(null);

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
      <Tela semCabecalho atualizando={idiomas.isRefetching} aoAtualizar={idiomas.refetch}>
        <Titulo titulo="Idiomas" subtitulo="O que você está aprendendo" />

        {idiomas.isPending ? (
          <Carregando />
        ) : idiomas.isError ? (
          <Erro erro={idiomas.error} aoTentarDeNovo={idiomas.refetch} />
        ) : idiomas.data.length === 0 ? (
          <Vazio
            titulo="Nenhum idioma ainda"
            texto="Cadastre o primeiro idioma que você está estudando."
            acao={{ rotulo: 'Cadastrar idioma', aoPressionar: () => router.push('/idioma/editar') }}
          />
        ) : (
          idiomas.data.map((i, indice) => (
            <Entrada key={i.id} indice={indice}>
            <Card mode="contained" style={cartaoProfundo}>
              <Card.Content style={styles.linha}>
                <CodigoIdioma codigo={i.codigo} />
                <View style={{ flex: 1 }}>
                  <Text variant="titleMedium" style={{ fontFamily: fontes.negrito }}>
                    {i.nome}
                  </Text>
                  <Text style={{ color: cores.textoSuave }}>
                    {i.bandeira} {plural(i.totalBaralhos ?? 0, 'baralho', 'baralhos')}
                  </Text>
                </View>
                <IconButton
                  icon="pencil-outline"
                  onPress={() => router.push({ pathname: '/idioma/editar', params: { id: i.id } })}
                />
                <IconButton icon="trash-can-outline" iconColor={cores.erro} onPress={() => setAExcluir(i)} />
              </Card.Content>
            </Card>
            </Entrada>
          ))
        )}
      </Tela>
      <FAB icon="plus" color={cores.sobreCor} label="Novo" style={styles.fab} onPress={() => router.push('/idioma/editar')} />
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
  linha: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingRight: 0 },
  bandeira: { fontSize: 34 },
  fab: { position: 'absolute', right: 16, bottom: 110, ...brilho(cores.lima), backgroundColor: cores.lima, borderRadius: 18 },
});
