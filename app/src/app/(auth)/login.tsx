import { LinearGradient } from 'expo-linear-gradient';
import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { autenticacao } from '@/api/hooks';
import { Entrada } from '@/components/Entrada';
import { Lingo } from '@/components/Lingo';
import { feedback } from '@/lib/feedback';
import { useAuth } from '@/store/auth';
import { cores, degrades } from '@/theme';

export default function Login() {
  const entrar = useAuth((s) => s.entrar);
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function handleEntrar() {
    setErro(null);
    setCarregando(true);
    try {
      const { token, usuario } = await autenticacao.login(email.trim(), senha);
      entrar(token, usuario); // o Stack.Protected leva para o app sozinho
    } catch (e) {
      feedback.erro();
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <LinearGradient colors={degrades.brilhoFundo} style={styles.brilho} />
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <Entrada style={styles.marca}>
          {/* O Lingo fica triste quando o login falha. */}
          <Lingo humor={erro ? 'triste' : 'feliz'} tamanho={130} />
          <Text variant="displaySmall" style={styles.nome}>
            Lingo Cards
          </Text>
          <Text style={styles.slogan}>Aprenda idiomas um cartão por vez.</Text>
        </Entrada>

        <TextInput
          mode="outlined"
          label="E-mail"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          autoComplete="email"
          keyboardType="email-address"
          left={<TextInput.Icon icon="email-outline" />}
        />
        <TextInput
          mode="outlined"
          label="Senha"
          value={senha}
          onChangeText={setSenha}
          secureTextEntry={!verSenha}
          left={<TextInput.Icon icon="lock-outline" />}
          right={<TextInput.Icon icon={verSenha ? 'eye-off' : 'eye'} onPress={() => setVerSenha(!verSenha)} />}
        />
        <HelperText type="error" visible={!!erro}>
          {erro}
        </HelperText>

        <Button
          mode="contained"
          onPress={handleEntrar}
          loading={carregando}
          disabled={carregando || !email || !senha}
          contentStyle={styles.botao}
        >
          Entrar
        </Button>

        <Link href="/cadastro" asChild>
          <Button mode="text">Não tem conta? Cadastre-se</Button>
        </Link>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 8 },
  marca: { alignItems: 'center', marginBottom: 28, gap: 6 },
  brilho: { position: 'absolute', top: 0, left: 0, right: 0, height: 460, pointerEvents: 'none' },
  nome: { color: cores.texto, fontWeight: '800', letterSpacing: -1 },
  slogan: { color: cores.textoSuave, fontSize: 16 },
  botao: { paddingVertical: 6 },
});
