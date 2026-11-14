import { StyleSheet, View } from 'react-native';
import { Card, List, Text } from 'react-native-paper';
import { Tela } from '@/components/Tela';
import { Logo } from '@/components/Logo';
import { cores, fontes } from '@/theme';

const REQUISITOS = [
  { icone: 'routes', titulo: 'Expo Router', texto: 'Navegação por arquivos: Stack, abas nativas (Native Tabs), telas modais e rotas protegidas por login (Stack.Protected).' },
  { icone: 'database-cog-outline', titulo: 'Estado global com Zustand', texto: 'Sessão do usuário (token e dados) persistida no armazenamento seguro do aparelho, e avisos globais (snackbar).' },
  { icone: 'api', titulo: 'Axios + TanStack Query', texto: 'Cliente HTTP com interceptadores (token JWT e sessão expirada) e cache, recarga e invalidação de dados após cada alteração.' },
  { icone: 'table-edit', titulo: 'CRUD completo das 4 entidades', texto: 'Idiomas, Baralhos, Cartões e Sessões de estudo: listar, ver, criar, editar e excluir.' },
  { icone: 'relation-one-to-many', titulo: '2 relacionamentos', texto: 'Idioma 1–N Baralho e Baralho 1–N Cartão, com exclusão em cascata.' },
  { icone: 'shield-account-outline', titulo: 'Cadastro, login e logout', texto: 'Autenticação JWT. O logout invalida o token no servidor.' },
  { icone: 'palette-outline', titulo: 'UI Kit: React Native Paper', texto: 'Material Design 3 com tema próprio: paleta lima/íris/coral, Bricolage Grotesque e JetBrains Mono.' },
  { icone: 'gesture-tap-button', titulo: 'Interação', texto: 'Botões, campos de texto, chips de seleção, menus, diálogos, contadores, puxar para atualizar e cartas que viram com animação (Reanimated).' },
];

const DIFERENCIAIS = [
  { icone: 'calendar-refresh', titulo: 'Repetição espaçada (SM-2)', texto: 'A API agenda cada cartão: o que você erra volta amanhã; o que domina, cada vez mais tarde. O app mostra o que revisar hoje.' },
  { icone: 'keyboard-outline', titulo: 'Resposta digitada com correção', texto: 'Além de virar a carta, dá para digitar a tradução. O app tolera maiúsculas e erros de digitação, e acento esquecido conta como "quase".' },
  { icone: 'volume-high', titulo: 'Pronúncia nativa', texto: 'Cada cartão pode ser ouvido com a voz do idioma (sintetizador do próprio celular, expo-speech).' },
  { icone: 'emoticon-happy-outline', titulo: 'Identidade própria', texto: 'Marca "Curva" (a curva do esquecimento quebrada por revisões), o mascote Lingo em SVG que reage às respostas, sons sintetizados para o app e vibração.' },
];

const BACKEND = ['Node.js + Express 5 + TypeScript', 'PostgreSQL (Neon) com Drizzle ORM', 'Autenticação JWT + bcrypt', 'Validação com Zod', 'Publicado no Render'];

export default function Sobre() {
  return (
    <Tela>
      <View style={styles.topo}>
        <Logo tamanho={44} />
        <Text variant="headlineSmall" style={{ fontFamily: fontes.titulo }}>
          Lingo Cards
        </Text>
        <Text style={styles.texto}>
          Flashcards de idiomas que sabem o que você está prestes a esquecer: o app agenda as revisões de cada cartão e
          mostra o que estudar hoje.
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
            titleStyle={{ fontFamily: fontes.negrito }}
            description={r.texto}
            descriptionNumberOfLines={4}
            left={(p) => <List.Icon {...p} icon={r.icone} color={cores.primaria} />}
          />
        ))}
      </Card>

      <Text variant="titleMedium" style={styles.secao}>
        Diferenciais
      </Text>
      <Card mode="contained">
        {DIFERENCIAIS.map((r) => (
          <List.Item
            key={r.titulo}
            title={r.titulo}
            titleStyle={{ fontFamily: fontes.negrito }}
            description={r.texto}
            descriptionNumberOfLines={4}
            left={(p) => <List.Icon {...p} icon={r.icone} color={cores.secundaria} />}
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
  texto: { color: cores.textoSuave, textAlign: 'center', lineHeight: 21 },
  secao: { fontFamily: fontes.negrito, marginTop: 4 },
  rodape: { color: cores.textoSuave, textAlign: 'center', fontSize: 12, marginTop: 8 },
});
