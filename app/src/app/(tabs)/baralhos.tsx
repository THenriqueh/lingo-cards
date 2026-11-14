import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Card, Chip, FAB, Text } from 'react-native-paper';
import { useBaralhos, useIdiomas } from '@/api/hooks';
import { ChipSelecao } from '@/components/ChipSelecao';
import { CodigoIdioma } from '@/components/CodigoIdioma';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Tela } from '@/components/Tela';
import { Titulo } from '@/components/Titulo';
import { Toque } from '@/components/Toque';
import { plural } from '@/lib/formato';
import { brilho, cartaoProfundo, cores, fontes } from '@/theme';

export default function Baralhos() {
  const router = useRouter();
  const [idiomaId, setIdiomaId] = useState<number | undefined>();
  const idiomas = useIdiomas();
  const baralhos = useBaralhos(idiomaId);

  const novo = () =>
    idiomas.data?.length ? router.push('/baralho/editar') : router.push('/idioma/editar');

  return (
    <View style={{ flex: 1 }}>
      <Tela semCabecalho atualizando={baralhos.isRefetching} aoAtualizar={baralhos.refetch}>
        <Titulo titulo="Baralhos" subtitulo="Seus conjuntos de cartões" />

        {(idiomas.data?.length ?? 0) > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0 }} contentContainerStyle={styles.filtros}>
            <ChipSelecao selecionado={!idiomaId} aoPressionar={() => setIdiomaId(undefined)}>
              Todos
            </ChipSelecao>
            {idiomas.data!.map((i) => (
              <ChipSelecao
                key={i.id}
                selecionado={idiomaId === i.id}
                aoPressionar={() => setIdiomaId(idiomaId === i.id ? undefined : i.id)}
              >
                {i.codigo.toUpperCase()} · {i.nome}
              </ChipSelecao>
            ))}
          </ScrollView>
        )}

        {baralhos.isPending ? (
          <Carregando />
        ) : baralhos.isError ? (
          <Erro erro={baralhos.error} aoTentarDeNovo={baralhos.refetch} />
        ) : baralhos.data.length === 0 ? (
          <Vazio
            titulo={idiomaId ? 'Nenhum baralho neste idioma' : 'Nenhum baralho ainda'}
            texto={idiomas.data?.length ? 'Crie um baralho para começar a adicionar cartões.' : 'Primeiro, cadastre o idioma que você está estudando.'}
            acao={{ rotulo: idiomas.data?.length ? 'Novo baralho' : 'Cadastrar idioma', aoPressionar: novo }}
          />
        ) : (
          baralhos.data.map((b, indice) => (
            <Entrada key={b.id} indice={indice}>
            <Toque aoPressionar={() => router.push({ pathname: '/baralho/[id]', params: { id: b.id } })}>
            <Card mode="contained" style={cartaoProfundo}>
              <Card.Content style={styles.cartao}>
                <CodigoIdioma codigo={b.idioma?.codigo} />
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="titleMedium" style={{ fontFamily: fontes.negrito }}>
                    {b.titulo}
                  </Text>
                  <Text style={{ color: cores.textoSuave }} numberOfLines={1}>
                    {b.descricao || b.idioma?.nome}
                  </Text>
                </View>
                <View style={{ alignItems: 'flex-end', gap: 4 }}>
                  <Chip compact textStyle={styles.nivel}>
                    {b.nivel}
                  </Chip>
                  <Text style={styles.total}>{plural(b.totalCartoes ?? 0, 'cartão', 'cartões')}</Text>
                  {(b.paraRevisar ?? 0) > 0 ? <Text style={styles.revisar}>{b.paraRevisar} p/ revisar</Text> : null}
                </View>
              </Card.Content>
            </Card>
            </Toque>
            </Entrada>
          ))
        )}
      </Tela>
      <FAB icon="plus" color={cores.sobreCor} label="Novo" style={styles.fab} onPress={novo} />
    </View>
  );
}

const styles = StyleSheet.create({
  filtros: { gap: 8 },
  cartao: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  bandeira: { fontSize: 32 },
  nivel: { fontSize: 12, fontFamily: fontes.negrito },
  total: { color: cores.textoSuave, fontSize: 12 },
  revisar: { color: cores.primaria, fontSize: 12, fontFamily: fontes.negrito },
  fab: { position: 'absolute', right: 16, bottom: 110, ...brilho(cores.lima), backgroundColor: cores.lima, borderRadius: 18 },
});
