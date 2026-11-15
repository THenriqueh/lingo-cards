import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { Text } from 'react-native-paper';
import { useBaralhos, useIdiomas } from '@/api/hooks';
import type { Baralho, Idioma } from '@/api/tipos';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Tela } from '@/components/Tela';
import { BotaoLima, BotaoSecundario, CabecalhoTela, Cartao, ChipFiltro } from '@/components/ui';
import { bandeiraDe } from '@/lib/bandeiras';
import { emQuantosDias, plural } from '@/lib/formato';
import { cores, fontes } from '@/theme';

function CartaoBaralho({ b }: { b: Baralho }) {
  const router = useRouter();
  const total = b.totalCartoes ?? 0;
  const dominados = b.dominados ?? 0;
  const pendentes = b.paraRevisar ?? 0;
  const revisao = total === 0 ? 'Sem cartões' : pendentes > 0 ? `${pendentes} para hoje` : `Revisão ${emQuantosDias(b.proximaRevisao)}`;

  return (
    <Pressable onPress={() => router.push({ pathname: '/baralho/[id]', params: { id: b.id } })}>
      <Cartao style={styles.baralho}>
        <View style={styles.linhaEntre}>
          <Text style={styles.idioma}>
            {bandeiraDe(b.idioma)}  {(b.idioma?.nome ?? '').toUpperCase()}
          </Text>
          <View style={styles.nivel}>
            <Text style={styles.nivelTexto}>{b.nivel}</Text>
          </View>
        </View>
        <Text style={styles.titulo}>{b.titulo}</Text>
        <View style={{ gap: 8 }}>
          <View style={styles.linhaEntre}>
            <Text style={styles.mono}>
              {dominados} de {total} {total === 1 ? 'dominado' : 'dominados'}
            </Text>
            <Text style={[styles.mono, pendentes > 0 && { color: cores.lima }]}>{revisao}</Text>
          </View>
          <View style={styles.trilho}>
            <View style={[styles.preenchido, { width: `${total ? Math.max(4, (dominados / total) * 100) : 0}%` }]} />
          </View>
        </View>
        <View style={styles.botoes}>
          <BotaoLima
            rotulo="Estudar"
            icone="play"
            style={{ flex: 1 }}
            aoPressionar={() =>
              total === 0
                ? router.push({ pathname: '/cartao/editar', params: { baralhoId: b.id } })
                : router.push({ pathname: '/estudar/[id]', params: { id: b.id, modo: pendentes > 0 ? 'revisao' : 'todos' } })
            }
          />
          <BotaoSecundario rotulo="Cartão" icone="plus" aoPressionar={() => router.push({ pathname: '/cartao/editar', params: { baralhoId: b.id } })} />
        </View>
      </Cartao>
    </Pressable>
  );
}

function IdiomaSemBaralho({ idioma }: { idioma: Idioma }) {
  const router = useRouter();
  return (
    <View style={styles.tracejado}>
      <Text style={styles.tracejadoTitulo}>
        {bandeiraDe(idioma)} {idioma.nome} ainda não tem baralhos
      </Text>
      <Text style={styles.tracejadoTexto}>Crie um com palavras de uma série, livro ou do trabalho.</Text>
      <Pressable onPress={() => router.push({ pathname: '/baralho/editar', params: { idiomaId: idioma.id } })}>
        <Text style={styles.criar}>+ Criar baralho</Text>
      </Pressable>
    </View>
  );
}

export default function Baralhos() {
  const router = useRouter();
  const [idiomaId, setIdiomaId] = useState<number | undefined>();
  const idiomas = useIdiomas();
  const todos = useBaralhos();

  const lista = (todos.data ?? []).filter((b) => !idiomaId || b.idiomaId === idiomaId);
  const totalCartoes = (todos.data ?? []).reduce((soma, b) => soma + (b.totalCartoes ?? 0), 0);
  const semBaralho = (idiomas.data ?? []).filter(
    (i) => (!idiomaId || i.id === idiomaId) && !(todos.data ?? []).some((b) => b.idiomaId === i.id),
  );
  const novo = () => (idiomas.data?.length ? router.push({ pathname: '/baralho/editar', params: idiomaId ? { idiomaId } : {} }) : router.push('/idioma/editar'));

  return (
    <Tela semCabecalho atualizando={todos.isRefetching} aoAtualizar={() => Promise.all([todos.refetch(), idiomas.refetch()])}>
      <CabecalhoTela
        rotulo={`${plural(todos.data?.length ?? 0, 'baralho', 'baralhos')} · ${plural(totalCartoes, 'cartão', 'cartões')}`}
        titulo="Baralhos"
        aoAdicionar={novo}
      />

      {(idiomas.data?.length ?? 0) > 0 && (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginHorizontal: -18 }} contentContainerStyle={styles.filtros}>
          <ChipFiltro ativo={!idiomaId} aoPressionar={() => setIdiomaId(undefined)}>
            Todos
          </ChipFiltro>
          {idiomas.data!.map((i) => (
            <ChipFiltro key={i.id} ativo={idiomaId === i.id} aoPressionar={() => setIdiomaId(idiomaId === i.id ? undefined : i.id)}>
              {bandeiraDe(i)} {i.nome}
            </ChipFiltro>
          ))}
        </ScrollView>
      )}

      {todos.isPending ? (
        <Carregando />
      ) : todos.isError ? (
        <Erro erro={todos.error} aoTentarDeNovo={todos.refetch} />
      ) : !idiomas.data?.length ? (
        <Vazio
          titulo="Nenhum idioma ainda"
          texto="Primeiro, diga qual idioma você está estudando."
          acao={{ rotulo: 'Cadastrar idioma', aoPressionar: () => router.push('/idioma/editar') }}
        />
      ) : (
        <>
          {lista.map((b, i) => (
            <Entrada key={b.id} indice={i}>
              <CartaoBaralho b={b} />
            </Entrada>
          ))}
          {semBaralho.map((i, n) => (
            <Entrada key={`sem-${i.id}`} indice={lista.length + n}>
              <IdiomaSemBaralho idioma={i} />
            </Entrada>
          ))}
        </>
      )}
    </Tela>
  );
}

const styles = StyleSheet.create({
  filtros: { gap: 8, paddingHorizontal: 18 },
  baralho: { padding: 14, gap: 12 },
  linhaEntre: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  idioma: { fontFamily: fontes.monoForte, fontSize: 11, letterSpacing: 0.8, color: cores.texto2 },
  nivel: { backgroundColor: cores.iris, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3 },
  nivelTexto: { fontFamily: fontes.monoForte, fontSize: 10, color: cores.sobreCor },
  titulo: { fontFamily: fontes.titulo, fontSize: 19, lineHeight: 22, letterSpacing: -0.4, color: cores.texto },
  mono: { fontFamily: fontes.mono, fontSize: 10, letterSpacing: 0.6, textTransform: 'uppercase', color: cores.textoSuave },
  trilho: { height: 4, borderRadius: 2, backgroundColor: cores.borda, overflow: 'hidden' },
  preenchido: { height: 4, borderRadius: 2, backgroundColor: cores.lima },
  botoes: { flexDirection: 'row', gap: 8 },
  tracejado: { borderWidth: 1.5, borderStyle: 'dashed', borderColor: cores.borda, borderRadius: 22, padding: 18, alignItems: 'center', gap: 6 },
  tracejadoTitulo: { fontFamily: fontes.negrito, fontSize: 16, color: cores.texto, textAlign: 'center' },
  tracejadoTexto: { fontFamily: fontes.corpo, fontSize: 14, color: cores.texto2, textAlign: 'center' },
  criar: { fontFamily: fontes.titulo, fontSize: 15, color: cores.lima, marginTop: 6 },
});
