import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, Chip, FAB, IconButton, Menu, SegmentedButtons, Text } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { useBaralho, useExcluirBaralho, useExcluirCartao } from '@/api/hooks';
import type { Cartao } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Confirmacao } from '@/components/Confirmacao';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Tela } from '@/components/Tela';
import { pendentes, plural, quandoRevisar } from '@/lib/formato';
import { pronunciar } from '@/lib/pronuncia';
import { usePreferencias, type ModoResposta } from '@/store/preferencias';
import { brilho, cartaoProfundo, cores } from '@/theme';

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
  const { modoResposta, definirModoResposta } = usePreferencias();

  if (baralho.isPending) return <Carregando />;
  if (baralho.isError) return <Erro erro={baralho.error} aoTentarDeNovo={baralho.refetch} />;
  const b = baralho.data;
  const cartoes = b.cartoes ?? [];
  const paraRevisar = pendentes(cartoes).length;
  const estudar = (modo: 'revisao' | 'todos') =>
    router.push({ pathname: '/estudar/[id]', params: { id: b.id, modo } });

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

        {cartoes.length === 0 ? (
          <Button mode="contained" icon="play" disabled contentStyle={{ paddingVertical: 8 }}>
            Adicione cartões para estudar
          </Button>
        ) : (
          <View style={{ gap: 10 }}>
            {/* Repetição espaçada: primeiro o que está para vencer. */}
            {paraRevisar > 0 ? (
              <Button mode="contained" icon="calendar-refresh" contentStyle={{ paddingVertical: 8 }} style={brilho(cores.primaria)} onPress={() => estudar('revisao')}>
                Revisar {plural(paraRevisar, 'cartão', 'cartões')} de hoje
              </Button>
            ) : (
              <Card mode="contained" style={[cartaoProfundo, { backgroundColor: `${cores.acerto}18` }]}>
                <Card.Content style={styles.emDia}>
                  <Text style={{ fontSize: 22 }}>✅</Text>
                  <Text style={{ color: cores.texto, flex: 1 }}>Revisões em dia! Os cartões voltam quando estiverem perto de ser esquecidos.</Text>
                </Card.Content>
              </Card>
            )}
            <Button mode={paraRevisar > 0 ? 'outlined' : 'contained'} icon="cards-playing-outline" contentStyle={{ paddingVertical: 6 }} onPress={() => estudar('todos')}>
              Estudar todos os cartões
            </Button>
            <SegmentedButtons
              value={modoResposta}
              onValueChange={(v) => definirModoResposta(v as ModoResposta)}
              buttons={[
                { value: 'virar', label: 'Virar carta', icon: 'rotate-3d-variant' },
                { value: 'digitar', label: 'Digitar resposta', icon: 'keyboard-outline' },
              ]}
            />
          </View>
        )}

        <Text variant="titleMedium" style={styles.secao}>
          Cartões
        </Text>
        {cartoes.length === 0 ? (
          <Vazio
            titulo="Baralho vazio"
            texto="Adicione palavras ou frases com a tradução no verso."
            acao={{ rotulo: 'Adicionar cartão', aoPressionar: () => router.push({ pathname: '/cartao/editar', params: { baralhoId: b.id } }) }}
          />
        ) : (
          cartoes.map((c, indice) => (
            <Entrada key={c.id} indice={indice}>
            <Card mode="contained" style={cartaoProfundo}>
              <Card.Content style={styles.cartao}>
                <View style={{ flex: 1, gap: 2 }}>
                  <Text variant="titleMedium" style={{ fontWeight: '700' }}>
                    {c.frente}
                  </Text>
                  <Text style={{ color: cores.secundaria }}>{c.verso}</Text>
                  {c.exemplo ? <Text style={styles.exemplo}>“{c.exemplo}”</Text> : null}
                  <Text style={styles.revisao}>{quandoRevisar(c.proximaRevisao)}</Text>
                </View>
                <IconButton icon="volume-high" size={20} iconColor={cores.secundaria} onPress={() => pronunciar(c.frente, b.idioma?.codigo)} />
                <IconButton icon="pencil-outline" size={20} onPress={() => router.push({ pathname: '/cartao/editar', params: { id: c.id } })} />
                <IconButton icon="trash-can-outline" size={20} iconColor={cores.erro} onPress={() => setCartaoAExcluir(c)} />
              </Card.Content>
            </Card>
            </Entrada>
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
  revisao: { color: cores.textoSuave, fontSize: 11, marginTop: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  emDia: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  fab: { position: 'absolute', right: 16, bottom: 40, ...brilho(cores.primaria) },
});
