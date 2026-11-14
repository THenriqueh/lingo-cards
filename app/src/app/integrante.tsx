import { Linking, StyleSheet, View } from 'react-native';
import { Avatar, Button, Card, Chip, Text } from 'react-native-paper';
import { Tela } from '@/components/Tela';
import { cores } from '@/theme';

const foto = require('@/assets/images/thallis.jpg');

const CONTRIBUICOES = [
  'Back-end completo em Express: modelagem do banco, autenticação JWT e CRUD das 4 entidades',
  'Publicação da API (Render) e do banco PostgreSQL (Neon)',
  'Todas as telas do app, navegação com Expo Router e rotas protegidas',
  'Estado global com Zustand e integração com Axios + TanStack Query',
  'Identidade visual e tema com React Native Paper',
  'Tela de estudo com animação de virar a carta',
];

export default function Integrante() {
  return (
    <Tela>
      <View style={styles.topo}>
        <Avatar.Image size={128} source={foto} style={styles.foto} />
        <Text variant="headlineSmall" style={{ fontWeight: '800', textAlign: 'center' }}>
          Thallis Henrique Ferreira
        </Text>
        <Text style={{ color: cores.secundaria, fontWeight: '600' }}>RA 00000830265</Text>
        <Text style={styles.texto}>Desenvolvedor backend (Java, Spring Boot e Kafka) e estudante de Sistemas para Internet na UNICAP.</Text>
        <View style={styles.chips}>
          <Chip icon="account-hard-hat">Desenvolvedor full stack do projeto</Chip>
        </View>
      </View>

      <Card mode="contained">
        <Card.Title title="O que eu implementei" titleStyle={{ fontWeight: '700' }} />
        <Card.Content style={{ gap: 8 }}>
          {CONTRIBUICOES.map((c) => (
            <Text key={c} style={{ color: cores.texto, lineHeight: 20 }}>
              ✓  {c}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <View style={styles.links}>
        <Button mode="contained-tonal" icon="github" style={{ flex: 1 }} onPress={() => Linking.openURL('https://github.com/THenriqueh')}>
          GitHub
        </Button>
        <Button
          mode="contained-tonal"
          icon="linkedin"
          style={{ flex: 1 }}
          onPress={() => Linking.openURL('https://www.linkedin.com/in/thallis-ferreira-dev-java')}
        >
          LinkedIn
        </Button>
      </View>
    </Tela>
  );
}

const styles = StyleSheet.create({
  topo: { alignItems: 'center', gap: 6, marginBottom: 6 },
  foto: { marginBottom: 8, borderWidth: 3, borderColor: cores.primaria },
  texto: { color: cores.textoSuave, textAlign: 'center', lineHeight: 21 },
  chips: { flexDirection: 'row', marginTop: 6 },
  links: { flexDirection: 'row', gap: 10 },
});
