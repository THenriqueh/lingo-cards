import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, List, Text } from 'react-native-paper';
import { queryClient } from '@/api/client';
import { autenticacao } from '@/api/hooks';
import { Tela } from '@/components/Tela';
import { Titulo } from '@/components/Titulo';
import { formatarData } from '@/lib/formato';
import { useAuth } from '@/store/auth';
import { cores } from '@/theme';

export default function Conta() {
  const router = useRouter();
  const { usuario, sair } = useAuth();
  const [saindo, setSaindo] = useState(false);

  async function handleSair() {
    setSaindo(true);
    try {
      await autenticacao.logout(); // invalida o token no servidor
    } catch {
      // Mesmo sem conexão, a sessão local é encerrada.
    }
    queryClient.clear();
    sair();
  }

  const iniciais = (usuario?.nome ?? '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Tela semCabecalho>
      <Titulo titulo="Conta" />
      <Card mode="contained">
        <Card.Content style={styles.perfil}>
          <Avatar.Text size={64} label={iniciais} style={{ backgroundColor: cores.primaria }} color={cores.fundo} />
          <View style={{ flex: 1 }}>
            <Text variant="titleLarge" style={{ fontWeight: '700' }}>
              {usuario?.nome}
            </Text>
            <Text style={{ color: cores.textoSuave }}>{usuario?.email}</Text>
            {usuario?.criadoEm ? (
              <Text style={{ color: cores.textoSuave, fontSize: 12 }}>Membro desde {formatarData(usuario.criadoEm)}</Text>
            ) : null}
          </View>
        </Card.Content>
      </Card>

      <Card mode="contained">
        <List.Item
          title="Sobre o app"
          description="Tecnologias e requisitos"
          left={(p) => <List.Icon {...p} icon="information-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          onPress={() => router.push('/sobre')}
        />
        <List.Item
          title="Desenvolvedor"
          description="Quem fez o Lingo Cards"
          left={(p) => <List.Icon {...p} icon="account-circle-outline" />}
          right={(p) => <List.Icon {...p} icon="chevron-right" />}
          onPress={() => router.push('/integrante')}
        />
      </Card>

      <Button mode="outlined" icon="logout" textColor={cores.erro} style={styles.sair} loading={saindo} onPress={handleSair}>
        Sair da conta
      </Button>
    </Tela>
  );
}

const styles = StyleSheet.create({
  perfil: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  sair: { borderColor: cores.erro, marginTop: 8 },
});
