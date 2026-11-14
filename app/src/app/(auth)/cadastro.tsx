import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { autenticacao } from '@/api/hooks';
import { useAuth } from '@/store/auth';
import { cores } from '@/theme';

export default function Cadastro() {
  const entrar = useAuth((s) => s.entrar);
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const senhaCurta = senha.length > 0 && senha.length < 6;

  async function handleCadastrar() {
    setErro(null);
    setCarregando(true);
    try {
      const { token, usuario } = await autenticacao.cadastro(nome.trim(), email.trim(), senha);
      entrar(token, usuario);
    } catch (e) {
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Text style={styles.texto}>Crie sua conta para montar seus baralhos e acompanhar seu progresso.</Text>
        <TextInput mode="outlined" label="Nome" value={nome} onChangeText={setNome} left={<TextInput.Icon icon="account-outline" />} />
        <TextInput
          mode="outlined"
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
        />
        <TextInput
          mode="outlined"
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry
          error={senhaCurta}
          left={<TextInput.Icon icon="lock-outline" />}
        />
        <HelperText type={erro || senhaCurta ? 'error' : 'info'} visible>
          {erro ?? 'A senha precisa ter pelo menos 6 caracteres.'}
        </HelperText>
        <Button
          mode="contained"
          onPress={handleCadastrar}
          loading={carregando}
          disabled={carregando || !nome.trim() || !email.trim() || senha.length < 6}
          contentStyle={{ paddingVertical: 6 }}
        >
          Criar conta
        </Button>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { padding: 24, gap: 8 },
  texto: { color: cores.textoSuave, marginBottom: 8, fontSize: 15 },
});
