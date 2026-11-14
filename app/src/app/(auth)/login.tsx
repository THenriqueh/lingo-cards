import { Link } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, View } from 'react-native';
import { Button, HelperText, Text, TextInput } from 'react-native-paper';
import { mensagemDeErro } from '@/api/client';
import { autenticacao } from '@/api/hooks';
import { BotaoPrincipal } from '@/components/BotaoPrincipal';
import { CurvaSerrote } from '@/components/CurvaSerrote';
import { Entrada } from '@/components/Entrada';
import { Lingo } from '@/components/Lingo';
import { Logo } from '@/components/Logo';
import { feedback } from '@/lib/feedback';
import { useAuth } from '@/store/auth';
import { cores, fontes, rotulo } from '@/theme';

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
      <ScrollView contentContainerStyle={styles.conteudo} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
        <Entrada>
          <Logo tamanho={36} />
        </Entrada>

        <Entrada indice={1} style={styles.chamada}>
          <Text style={styles.frase}>
            O app que sabe o que você está prestes a <Text style={{ color: cores.lima }}>esquecer.</Text>
          </Text>
          <View style={styles.curva}>
            <CurvaSerrote largura={190} altura={44} cor={cores.lima} />
            {/* O Lingo fica triste quando o login falha. */}
            <Lingo humor={erro ? 'triste' : 'feliz'} tamanho={48} />
          </View>
        </Entrada>

        <Entrada indice={2} style={{ gap: 10 }}>
          <Text style={rotulo}>Entrar</Text>
          <TextInput
            mode="outlined"
            label="E-mail"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            outlineStyle={styles.campo}
            left={<TextInput.Icon icon="email-outline" />}
          />
          <TextInput
            mode="outlined"
            label="Senha"
            value={senha}
            onChangeText={setSenha}
            secureTextEntry={!verSenha}
            outlineStyle={styles.campo}
            left={<TextInput.Icon icon="lock-outline" />}
            right={<TextInput.Icon icon={verSenha ? 'eye-off' : 'eye'} onPress={() => setVerSenha(!verSenha)} />}
          />
          <HelperText type="error" visible={!!erro} style={{ marginTop: -6 }}>
            {erro}
          </HelperText>
          <BotaoPrincipal rotulo="Entrar" carregando={carregando} desativado={!email || !senha} aoPressionar={handleEntrar} />
          <Link href="/cadastro" asChild>
            <Button mode="text" textColor={cores.texto2} style={{ marginTop: 4 }}>
              Não tem conta? <Text style={{ color: cores.lima, fontFamily: fontes.negrito }}>Cadastre-se</Text>
            </Button>
          </Link>
        </Entrada>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo },
  conteudo: { flexGrow: 1, justifyContent: 'center', padding: 24, gap: 28 },
  chamada: { gap: 14 },
  frase: { fontFamily: fontes.titulo, fontSize: 32, lineHeight: 36, color: cores.texto, letterSpacing: -1.2 },
  curva: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
  campo: { borderRadius: 16 },
});
