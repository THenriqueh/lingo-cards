import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { useCartao, useSalvarCartao } from '@/api/hooks';
import type { Cartao } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Carregando } from '@/components/Estados';
import { cores } from '@/theme';

export default function EditarCartao() {
  const { id, baralhoId } = useLocalSearchParams<{ id?: string; baralhoId?: string }>();
  const cartao = useCartao(Number(id ?? 0));

  if (id && !cartao.data) return <Carregando />;
  return <Formulario existente={id ? cartao.data : undefined} baralhoId={Number(baralhoId ?? cartao.data?.baralhoId)} />;
}

function Formulario({ existente, baralhoId }: { existente?: Cartao; baralhoId: number }) {
  const router = useRouter();
  const salvar = useSalvarCartao();
  const avisar = useAviso((s) => s.mostrar);
  const [frente, setFrente] = useState(existente?.frente ?? '');
  const [verso, setVerso] = useState(existente?.verso ?? '');
  const [exemplo, setExemplo] = useState(existente?.exemplo ?? '');
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvar(continuar: boolean) {
    setErro(null);
    try {
      await salvar.mutateAsync({
        id: existente?.id,
        baralhoId,
        frente: frente.trim(),
        verso: verso.trim(),
        exemplo: exemplo.trim() || null,
      });
      if (continuar) {
        avisar('Cartão adicionado. Pode cadastrar o próximo.');
        setFrente('');
        setVerso('');
        setExemplo('');
      } else {
        avisar(existente ? 'Cartão atualizado.' : 'Cartão adicionado.');
        router.back();
      }
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  const valido = frente.trim().length > 0 && verso.trim().length > 0 && !salvar.isPending;

  return (
    <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existente ? 'Editar cartão' : 'Novo cartão' }} />
      <Text style={styles.dica}>A frente é o que você vai tentar lembrar; o verso, a resposta.</Text>
      <TextInput mode="outlined" label="Frente (ex.: die Katze)" value={frente} onChangeText={setFrente} maxLength={200} />
      <TextInput mode="outlined" label="Verso (ex.: o gato)" value={verso} onChangeText={setVerso} maxLength={200} />
      <TextInput
        mode="outlined"
        label="Frase de exemplo (opcional)"
        value={exemplo}
        onChangeText={setExemplo}
        multiline
        maxLength={500}
      />
      <HelperText type="error" visible={!!erro}>
        {erro}
      </HelperText>
      <Button mode="contained" icon="content-save" onPress={() => handleSalvar(false)} loading={salvar.isPending} disabled={!valido} contentStyle={{ paddingVertical: 6 }}>
        Salvar
      </Button>
      {!existente && (
        <Button mode="outlined" icon="plus" onPress={() => handleSalvar(true)} disabled={!valido}>
          Salvar e adicionar outro
        </Button>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 20, gap: 10, backgroundColor: cores.fundo, flexGrow: 1 },
  dica: { color: cores.textoSuave, marginBottom: 4 },
});
