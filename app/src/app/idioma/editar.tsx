import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { Button, Chip, HelperText, Text, TextInput } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { useIdiomas, useSalvarIdioma } from '@/api/hooks';
import type { Idioma } from '@/api/tipos';
import { useAviso } from '@/components/Aviso';
import { Carregando } from '@/components/Estados';
import { cores } from '@/theme';

const SUGESTOES = [
  { nome: 'Alemão', codigo: 'de', bandeira: '🇩🇪' },
  { nome: 'Inglês', codigo: 'en', bandeira: '🇺🇸' },
  { nome: 'Espanhol', codigo: 'es', bandeira: '🇪🇸' },
  { nome: 'Francês', codigo: 'fr', bandeira: '🇫🇷' },
  { nome: 'Italiano', codigo: 'it', bandeira: '🇮🇹' },
  { nome: 'Japonês', codigo: 'ja', bandeira: '🇯🇵' },
];

export default function EditarIdioma() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const idiomas = useIdiomas();
  const existente = id ? idiomas.data?.find((i) => i.id === Number(id)) : undefined;

  if (id && !existente) return <Carregando />;
  return <Formulario existente={existente} />;
}

function Formulario({ existente }: { existente?: Idioma }) {
  const router = useRouter();
  const salvar = useSalvarIdioma();
  const avisar = useAviso((s) => s.mostrar);
  const [nome, setNome] = useState(existente?.nome ?? '');
  const [codigo, setCodigo] = useState(existente?.codigo ?? '');
  const [bandeira, setBandeira] = useState(existente?.bandeira ?? '🌐');
  const [erro, setErro] = useState<string | null>(null);

  async function handleSalvar() {
    setErro(null);
    try {
      await salvar.mutateAsync({ id: existente?.id, nome: nome.trim(), codigo: codigo.trim(), bandeira: bandeira.trim() || '🌐' });
      avisar(existente ? 'Idioma atualizado.' : 'Idioma cadastrado.');
      router.back();
    } catch (e) {
      setErro(mensagemDeErro(e));
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
      <Stack.Screen options={{ title: existente ? 'Editar idioma' : 'Novo idioma' }} />

      {!existente && (
        <>
          <Text style={styles.rotulo}>Sugestões</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
            {SUGESTOES.map((s) => (
              <Chip
                key={s.codigo}
                selected={codigo === s.codigo}
                showSelectedCheck={false}
                onPress={() => {
                  setNome(s.nome);
                  setCodigo(s.codigo);
                  setBandeira(s.bandeira);
                }}
              >
                {s.bandeira} {s.nome}
              </Chip>
            ))}
          </ScrollView>
        </>
      )}

      <TextInput mode="outlined" label="Nome do idioma" value={nome} onChangeText={setNome} />
      <TextInput
        mode="outlined"
        label="Código (ex.: de, en)"
        value={codigo}
        onChangeText={setCodigo}
        autoCapitalize="none"
        maxLength={10}
      />
      <TextInput mode="outlined" label="Bandeira (emoji)" value={bandeira} onChangeText={setBandeira} maxLength={16} />

      <HelperText type="error" visible={!!erro}>
        {erro}
      </HelperText>
      <Button
        mode="contained"
        icon="content-save"
        onPress={handleSalvar}
        loading={salvar.isPending}
        disabled={salvar.isPending || nome.trim().length < 2 || codigo.trim().length < 2}
        contentStyle={{ paddingVertical: 6 }}
      >
        Salvar
      </Button>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  conteudo: { padding: 20, gap: 10, backgroundColor: cores.fundo, flexGrow: 1 },
  rotulo: { color: cores.textoSuave, fontSize: 13 },
});
