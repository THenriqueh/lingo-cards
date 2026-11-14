import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Icon, Text, TextInput } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { autenticacao } from '@/api/hooks';
import { useAuth } from '@/store/auth';
import { cores } from '@/theme';

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
      setErro(mensagemDeErro(e));
    } finally {
      setCarregando(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.tela} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled">
        <View style={styles.marca}>
          <View style={styles.logo}>
            <Icon source="cards" size={44} color={cores.fundo} />
          </View>
          <Text variant="displaySmall" style={styles.nome}>
            Lingo Cards
          </Text>
          <Text style={styles.slogan}>Aprenda idiomas um cartão por vez.</Text>
        </View>

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
  logo: {
    width: 84,
    height: 84,
    borderRadius: 26,
    backgroundColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    transform: [{ rotate: '-8deg' }],
  },
  nome: { color: cores.texto, fontWeight: '800', letterSpacing: -1 },
  slogan: { color: cores.textoSuave, fontSize: 16 },
  botao: { paddingVertical: 6 },
});
