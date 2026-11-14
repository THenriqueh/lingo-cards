import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, FAB, IconButton, Menu, Text } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { useBaralho, useExcluirBaralho, useExcluirCartao } from '@/api/hooks';
import type { Cartao } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Confirmacao } from '@/components/Confirmacao';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Tela } from '@/components/Tela';
import { plural } from '@/lib/formato';
import { cores } from '@/theme';

export default function DetalheBaralho() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const baralho = useBaralho(Number(id));
  const excluirBaralho = useExcluirBaralho();
  const excluirCartao = useExcluirCartao();
  const avisar = useAviso((s) => s.mostrar);
  const [menu, setMenu] = useState(false);
  const [confirmarBaralho, setConfirmarBaralho] = useState(false);
  const [cartaoAExcluir, setCartaoAExcluir] = useState<Cartao | null>(null);

  if (baralho.isPending) return <Carregando />;
  if (baralho.isError) return <Erro erro={baralho.error} aoTentarDeNovo={baralho.refetch} />;
  const b = baralho.data;
  const cartoes = b.cartoes ?? [];

  async function handleExcluirBaralho() {
    try {
      await excluirBaralho.mutateAsync(b.id);
      avisar('Baralho excluído.');
      router.back();
    } catch (e) {
      avisar(mensagemDeErro(e));
      setConfirmarBaralho(false);
    }
  }

  async function handleExcluirCartao() {
    if (!cartaoAExcluir) return;
    try {
      await excluirCartao.mutateAsync(cartaoAExcluir.id);
      avisar('Cartão excluído.');
    } catch (e) {
      avisar(mensagemDeErro(e));
    } finally {
      setCartaoAExcluir(null);
    }
  }

  return (
    <View style={{ flex: 1 }}>
      <Stack.Screen
        options={{
          title: '',
          headerRight: () => (
            <Menu visible={menu} onDismiss={() => setMenu(false)} anchor={<IconButton icon="dots-vertical" onPress={() => setMenu(true)} />}>
              <Menu.Item
                leadingIcon="pencil-outline"
                title="Editar baralho"
                onPress={() => {
                  setMenu(false);
                  router.push({ pathname: '/baralho/editar', params: { id: b.id } });
                }}
              />
              <Menu.Item
                leadingIcon="trash-can-outline"
                title="Excluir baralho"
                titleStyle={{ color: cores.erro }}
                onPress={() => {
                  setMenu(false);
                  setConfirmarBaralho(true);
                }}
              />
            </Menu>
          ),
        }}
      />
      <Tela atualizando={baralho.isRefetching} aoAtualizar={baralho.refetch}>
        <View style={{ gap: 8 }}>
          <Text variant="headlineMedium" style={styles.titulo}>
            {b.titulo}
          </Text>
          <View style={styles.tags}>
            <Chip icon={() => <Text>{b.idioma?.bandeira}</Text>} compact>
              {b.idioma?.nome}
            </Chip>
            <Chip compact>Nível {b.nivel}</Chip>
            <Chip compact icon="cards-outline">
              {plural(cartoes.length, 'cartão', 'cartões')}
            </Chip>
          </View>
          {b.descricao ? <Text style={styles.descricao}>{b.descricao}</Text> : null}
        </View>

        <Button
          mode="contained"
          icon="play"
          disabled={cartoes.length === 0}
          contentStyle={{ paddingVertical: 8 }}
          onPress={() => router.push({ pathname: '/estudar/[id]', params: { id: b.id } })}
        >
          {cartoes.length === 0 ? 'Adicione cartões para estudar' : 'Estudar agora'}
        </Button>

        <Text variant="titleMedium" style={styles.secao}>
          Cartões
        </Text>
        {cartoes.length === 0 ? (
          <Vazio
            icone="card-plus-outline"
            titulo="Baralho vazio"
            texto="Adicione palavras ou frases com a tradução no verso."
            acao={{ rotulo: 'Adicionar cartão', aoPressionar: () => router.push({ pathname: '/cartao/editar', params: { baralhoId: b.id } }) }}
          />
        ) : (
          cartoes.map((c) => (
            <Card key={c.id} mode="contained">
              <Card.Content style={styles.cartao}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    {c.frente}
                  </Text>
                  <Text style={{ color: cores.secundaria }}>{c.verso}</Text>
                  {c.exemplo ? <Text style={styles.exemplo}>“{c.exemplo}”</Text> : null}
                </View>
                <IconButton icon="pencil-outline" size={20} onPress={() => router.push({ pathname: '/cartao/editar', params: { id: c.id } })} />
                <IconButton icon="trash-can-outline" size={20} iconColor={cores.erro} onPress={() => setCartaoAExcluir(c)} />
              </Card.Content>
            </Card>
          ))
        )}
      </Tela>

      <FAB icon="plus" style={styles.fab} onPress={() => router.push({ pathname: '/cartao/editar', params: { baralhoId: b.id } })} />

      <Confirmacao
        visivel={confirmarBaralho}
        titulo="Excluir baralho?"
        mensagem={`"${b.titulo}" e seus ${plural(cartoes.length, 'cartão', 'cartões')} serão excluídos.`}
        carregando={excluirBaralho.isPending}
        aoConfirmar={handleExcluirBaralho}
        aoCancelar={() => setConfirmarBaralho(false)}
      />
      <Confirmacao
        visivel={!!cartaoAExcluir}
        titulo="Excluir cartão?"
        mensagem={`"${cartaoAExcluir?.frente}" será removido do baralho.`}
        carregando={excluirCartao.isPending}
        aoConfirmar={handleExcluirCartao}
        aoCancelar={() => setCartaoAExcluir(null)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  titulo: { color: cores.texto, fontWeight: '800' },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  descricao: { color: cores.textoSuave, fontSize: 15 },
  secao: { color: cores.texto, fontWeight: '700', marginTop: 6 },
  cartao: { flexDirection: 'row', alignItems: 'center', paddingRight: 0 },
  exemplo: { color: cores.textoSuave, fontStyle: 'italic', fontSize: 13, marginTop: 2 },
  fab: { position: 'absolute', right: 16, bottom: 40 },
});
