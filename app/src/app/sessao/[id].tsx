import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Card, HelperText, IconButton, Text } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { useExcluirSessao, useSalvarSessao, useSessao } from '@/api/hooks';
import type { Sessao } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Confirmacao } from '@/components/Confirmacao';
import { Carregando, Erro } from '@/components/Estados';
import { formatarData, formatarDuracao, percentual } from '@/lib/formato';
import { cores } from '@/theme';

export default function DetalheSessao() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const sessao = useSessao(Number(id));
  if (sessao.isPending) return <Carregando />;
  if (sessao.isError) return <Erro erro={sessao.error} aoTentarDeNovo={sessao.refetch} />;
  return <Formulario sessao={sessao.data} />;
}

function Contador({ rotulo, valor, cor, aoMudar }: { rotulo: string; valor: number; cor: string; aoMudar: (n: number) => void }) {
  return (
    <Card mode="contained" style={{ flex: 1 }}>
      <Card.Content style={{ alignItems: 'center' }}>
        <Text style={{ color: cores.textoSuave }}>{rotulo}</Text>
        <Text variant="displaySmall" style={{ color: cor, fontWeight: '800' }}>
          {valor}
        </Text>
        <View style={{ flexDirection: 'row' }}>
          <IconButton icon="minus" mode="contained-tonal" disabled={valor === 0} onPress={() => aoMudar(valor - 1)} />
          <IconButton icon="plus" mode="contained-tonal" onPress={() => aoMudar(valor + 1)} />
        </View>
      </Card.Content>
    </Card>
  );
}

function Formulario({ sessao }: { sessao: Sessao }) {
  const router = useRouter();
  const salvar = useSalvarSessao();
  const excluir = useExcluirSessao();
  const avisar = useAviso((s) => s.mostrar);
  const [acertos, setAcertos] = useState(sessao.acertos);
  const [erros, setErros] = useState(sessao.erros);
  const [confirmar, setConfirmar] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const alterado = acertos !== sessao.acertos || erros !== sessao.erros;

  async function handleSalvar() {
    setErro(null);
    try {
      await salvar.mutateAsync({ id: sessao.id, baralhoId: sessao.baralhoId, acertos, erros, duracaoSegundos: sessao.duracaoSegundos });
      avisar('Sessão atualizada.');
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  async function handleExcluir() {
    try {
      await excluir.mutateAsync(sessao.id);
      avisar('Sessão excluída.');
      router.back();
    } catch (e) {
      setConfirmar(false);
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.conteudo}>
      <Text variant="headlineSmall" style={{ fontWeight: '800' }}>
        {sessao.baralho?.titulo}
      </Text>
      <Text style={{ color: cores.textoSuave }}>
        {formatarData(sessao.realizadaEm)} · {formatarDuracao(sessao.duracaoSegundos)} · {percentual(acertos, erros)}% de acerto
      </Text>

      <View style={{ flexDirection: 'row', gap: 10, marginTop: 8 }}>
        <Contador rotulo="Acertos" valor={acertos} cor={cores.acerto} aoMudar={setAcertos} />
        <Contador rotulo="Erros" valor={erros} cor={cores.erro} aoMudar={setErros} />
      </View>

      <HelperText type="error" visible={!!erro}>
        {erro}
      </HelperText>
      <Button mode="contained" icon="content-save" disabled={!alterado || salvar.isPending} loading={salvar.isPending} onPress={handleSalvar}>
        Salvar correção
      </Button>
      <Button mode="outlined" icon="trash-can-outline" textColor={cores.erro} style={{ borderColor: cores.erro }} onPress={() => setConfirmar(true)}>
        Excluir sessão
      </Button>

      <Confirmacao
        visivel={confirmar}
        titulo="Excluir sessão?"
        mensagem="Ela deixa de contar nas suas estatísticas."
        carregando={excluir.isPending}
        aoConfirmar={handleExcluir}
        aoCancelar={() => setConfirmar(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 20, gap: 10, backgroundColor: cores.fundo, flexGrow: 1 },
});
