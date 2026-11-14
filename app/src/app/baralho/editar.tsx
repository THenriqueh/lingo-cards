import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Button, Chip, HelperText, Text, TextInput } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { useBaralho, useIdiomas, useSalvarBaralho } from '@/api/hooks';
import type { Baralho, Idioma } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Carregando, Erro } from '@/components/Estados';
import { cores, NIVEIS } from '@/theme';

export default function EditarBaralho() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const idiomas = useIdiomas();
  const baralho = useBaralho(Number(id ?? 0));

  if (idiomas.isError) return <Erro erro={idiomas.error} aoTentarDeNovo={idiomas.refetch} />;
  if (!idiomas.data || (id && !baralho.data)) return <Carregando />;
  return <Formulario idiomas={idiomas.data} existente={id ? baralho.data : undefined} />;
}

function Formulario({ idiomas, existente }: { idiomas: Idioma[]; existente?: Baralho }) {
  const router = useRouter();
  const salvar = useSalvarBaralho();
  const avisar = useAviso((s) => s.mostrar);
  const [titulo, setTitulo] = useState(existente?.titulo ?? '');
  const [descricao, setDescricao] = useState(existente?.descricao ?? '');
  const [idiomaId, setIdiomaId] = useState<number | undefined>(existente?.idiomaId ?? idiomas[0]?.id);
  const [nivel, setNivel] = useState(existente?.nivel ?? 'A1');
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvar() {
    if (!idiomaId) return;
    setErro(null);
    try {
      const salvo = await salvar.mutateAsync({ id: existente?.id, titulo: titulo.trim(), descricao: descricao.trim(), idiomaId, nivel });
      avisar(existente ? 'Baralho atualizado.' : 'Baralho criado. Agora adicione cartões!');
      if (existente) router.back();
      else router.replace({ pathname: '/baralho/[id]', params: { id: salvo.id } });
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existente ? 'Editar baralho' : 'Novo baralho' }} />

      <TextInput mode="outlined" label="Título" value={titulo} onChangeText={setTitulo} maxLength={80} />
      <TextInput
        mode="outlined"
        label="Descrição (opcional)"
        value={descricao}
        onChangeText={setDescricao}
        multiline
        maxLength={500}
      />

      <Text style={styles.rotulo}>Idioma</Text>
      <View style={styles.chips}>
        {idiomas.map((i) => (
          <Chip key={i.id} selected={idiomaId === i.id} onPress={() => setIdiomaId(i.id)}>
            {i.bandeira} {i.nome}
          </Chip>
        ))}
      </View>

      <Text style={styles.rotulo}>Nível (Quadro Europeu)</Text>
      <View style={styles.chips}>
        {NIVEIS.map((n) => (
          <Chip key={n} selected={nivel === n} showSelectedCheck={false} onPress={() => setNivel(n)} style={styles.nivel}>
            {n}
          </Chip>
        ))}
      </View>

      <HelperText type="error" visible={!!erro}>
        {erro}
      </HelperText>
      <Button
        mode="contained"
        icon="content-save"
        onPress={handleSalvar}
        loading={salvar.isPending}
        disabled={salvar.isPending || titulo.trim().length < 2 || !idiomaId}
        contentStyle={{ paddingVertical: 6 }}
      >
        Salvar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 20, gap: 10, backgroundColor: cores.fundo, flexGrow: 1 },
  rotulo: { color: cores.textoSuave, fontSize: 13, marginTop: 6 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  nivel: { minWidth: 52 },
});
