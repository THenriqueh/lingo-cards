import { StyleSheet, View } from 'react-native';
import { Card, Icon, List, Text } from 'react-native-paper';
import { Tela } from '@/components/Tela';
import { cores } from '@/theme';

const REQUISITOS = [
  { icone: 'routes', titulo: 'Expo Router', texto: 'Navegação por arquivos: Stack, abas nativas (Native Tabs), telas modais e rotas protegidas por login (Stack.Protected).' },
  { icone: 'database-cog-outline', titulo: 'Estado global com Zustand', texto: 'Sessão do usuário (token e dados) persistida no armazenamento seguro do aparelho, e avisos globais (snackbar).' },
  { icone: 'api', titulo: 'Axios + TanStack Query', texto: 'Cliente HTTP com interceptadores (token JWT e sessão expirada) e cache, recarga e invalidação de dados após cada alteração.' },
  { icone: 'table-edit', titulo: 'CRUD completo das 4 entidades', texto: 'Idiomas, Baralhos, Cartões e Sessões de estudo: listar, ver, criar, editar e excluir.' },
  { icone: 'relation-one-to-many', titulo: '2 relacionamentos', texto: 'Idioma 1–N Baralho e Baralho 1–N Cartão, com exclusão em cascata.' },
  { icone: 'shield-account-outline', titulo: 'Cadastro, login e logout', texto: 'Autenticação JWT. O logout invalida o token no servidor.' },
  { icone: 'palette-outline', titulo: 'UI Kit: React Native Paper', texto: 'Material Design 3 com tema escuro personalizado.' },
  { icone: 'gesture-tap-button', titulo: 'Interação', texto: 'Botões, campos de texto, chips de seleção, menus, diálogos, contadores, puxar para atualizar e cartas que viram com animação (Reanimated).' },
];

const BACKEND = ['Node.js + Express 5 + TypeScript', 'PostgreSQL (Neon) com Drizzle ORM', 'Autenticação JWT + bcrypt', 'Validação com Zod', 'Publicado no Render'];

export default function Sobre() {
  return (
    <Tela>
      <View style={styles.topo}>
        <View style={styles.logo}>
          <Icon source="cards" size={36} color={cores.fundo} />
        </View>
        <Text variant="headlineSmall" style={{ fontWeight: '800' }}>
          Lingo Cards
        </Text>
        <Text style={styles.texto}>
          Flashcards para estudar idiomas: monte baralhos por idioma e nível, estude virando as cartas e acompanhe seu
          desempenho a cada sessão.
        </Text>
      </View>

      <Text variant="titleMedium" style={styles.secao}>
        Requisitos implementados
      </Text>
      <Card mode="contained">
        {REQUISITOS.map((r) => (
          <List.Item
            key={r.titulo}
            title={r.titulo}
            titleStyle={{ fontWeight: '700' }}
            description={r.texto}
            descriptionNumberOfLines={4}
            left={(p) => <List.Icon {...p} icon={r.icone} color={cores.primaria} />}
          />
        ))}
      </Card>

      <Text variant="titleMedium" style={styles.secao}>
        Back-end próprio
      </Text>
      <Card mode="contained">
        <Card.Content style={{ gap: 6 }}>
          {BACKEND.map((b) => (
            <Text key={b} style={{ color: cores.texto }}>
              •  {b}
            </Text>
          ))}
        </Card.Content>
      </Card>

      <Text style={styles.rodape}>Programação para Dispositivos Móveis · UNICAP · 2026</Text>
    </Tela>
  );
}

const styles = StyleSheet.create({
  topo: { alignItems: 'center', gap: 8, marginBottom: 6 },
  logo: { width: 68, height: 68, borderRadius: 22, backgroundColor: cores.primaria, alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '-8deg' }] },
  texto: { color: cores.textoSuave, textAlign: 'center', lineHeight: 21 },
  secao: { fontWeight: '700', marginTop: 4 },
  rodape: { color: cores.textoSuave, textAlign: 'center', fontSize: 12, marginTop: 8 },
});
