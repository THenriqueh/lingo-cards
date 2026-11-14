import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, IconButton, ProgressBar, Text, TextInput } from 'react-native-paper';
import Animated, { FadeIn, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { mensagemDeErro } from '@/api/client';
import { useBaralho, useRevisarCartao, useSalvarSessao } from '@/api/hooks';
import type { Baralho, Cartao, NotaRevisao } from '@/api/tipos';
import { AnelProgresso } from '@/components/AnelProgresso';
import { Confete } from '@/components/Confete';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Lingo, type Humor } from '@/components/Lingo';
import { feedback } from '@/lib/feedback';
import { formatarDuracao, pendentes, percentual } from '@/lib/formato';
import { pronunciar } from '@/lib/pronuncia';
import { avaliarResposta, type Avaliacao } from '@/lib/resposta';
import { usePreferencias } from '@/store/preferencias';
import { brilho, cores, degrades, sombra } from '@/theme';

function embaralhar<T>(lista: T[]) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Cada carta nova surge com um leve fade e quase nenhum zoom.
function entradaCarta() {
  'worklet';
  return {
    initialValues: { opacity: 0, transform: [{ scale: 0.97 }] },
    animations: {
      opacity: withTiming(1, { duration: 200 }),
      transform: [{ scale: withTiming(1, { duration: 200 }) }],
    },
  };
}

const sortear = (frases: string[]) => frases[Math.floor(Math.random() * frases.length)];
const FALAS: Record<NotaRevisao, string[]> = {
  acertei: ['Isso aí! 🎯', 'Mandou bem!', 'Perfeito!', 'Arrasou! ✨'],
  facil: ['Fácil demais! 😎'],
  dificil: ['Quase! Confere a resposta.', 'Foi por pouco!'],
  errei: ['Tudo bem, errar faz parte.', 'Anota essa! 📝', 'Na próxima vai!'],
};
const NOTA_DA_AVALIACAO: Record<Avaliacao, NotaRevisao> = { certa: 'acertei', quase: 'dificil', errada: 'errei' };

export default function Estudar() {
  const { id, modo } = useLocalSearchParams<{ id: string; modo?: 'revisao' | 'todos' }>();
  const baralho = useBaralho(Number(id));
  // A fila é decidida uma vez: depois de salvar, o baralho é recarregado e não pode mudar a sessão em andamento.
  const [fila, setFila] = useState<{ cartoes: Cartao[]; revisao: boolean } | null>(null);

  if (baralho.isPending) return <Carregando />;
  if (baralho.isError) return <Erro erro={baralho.error} aoTentarDeNovo={baralho.refetch} />;

  const todos = baralho.data.cartoes ?? [];
  if (fila === null) {
    const revisao = modo === 'revisao';
    setFila({ cartoes: revisao ? pendentes(todos) : todos, revisao });
    return <Carregando />;
  }

  if (!todos.length) return <Vazio humor="triste" titulo="Baralho vazio" texto="Adicione cartões antes de estudar." />;
  if (!fila.cartoes.length) {
    return (
      <Vazio
        humor="comemorando"
        titulo="Tudo revisado por hoje!"
        texto="Os cartões deste baralho só voltam quando estiverem perto de ser esquecidos."
        acao={{ rotulo: 'Estudar todos mesmo assim', icone: 'cards-playing-outline', aoPressionar: () => setFila({ cartoes: todos, revisao: false }) }}
      />
    );
  }
  return <Sessao key={`${fila.revisao}`} baralho={baralho.data} cartoes={fila.cartoes} />;
}

function Sessao({ baralho, cartoes }: { baralho: Baralho; cartoes: Cartao[] }) {
  const router = useRouter();
  const salvar = useSalvarSessao();
  const revisar = useRevisarCartao();
  const modoResposta = usePreferencias((s) => s.modoResposta);
  const digitar = modoResposta === 'digitar';

  // Só os cartões com revisão vencida atualizam o agendamento (e só na primeira rodada).
  const [devidos] = useState(() => new Set(pendentes(cartoes).map((c) => c.id)));
  const [rodada, setRodada] = useState(0);
  const [ordem, setOrdem] = useState<Cartao[]>(() => embaralhar(cartoes));
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [inicio, setInicio] = useState(() => Date.now());
  const [resultado, setResultado] = useState<{ duracao: number; erro?: string } | null>(null);
  const [humor, setHumor] = useState<Humor>('neutro');
  const [fala, setFala] = useState(digitar ? 'Digite a tradução!' : 'Vamos lá! Você sabe esta?');
  const [resposta, setResposta] = useState('');
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);

  const rotacao = useSharedValue(0);
  const frenteEstilo = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotacao.value, [0, 1], [0, 180])}deg` }],
  }));
  const versoEstilo = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotacao.value, [0, 1], [180, 360])}deg` }],
  }));

  const cartao = ordem[indice];
  const codigoIdioma = baralho.idioma?.codigo;

  function virar(paraVerso = !virado, comentar = true) {
    if (paraVerso === virado) return;
    feedback.virar();
    rotacao.value = withTiming(paraVerso ? 1 : 0, { duration: 380 });
    if (paraVerso && comentar && !avaliacao) {
      setHumor('pensando');
      setFala('E aí, acertou?');
    }
    setVirado(paraVerso);
  }

  /** Registra a nota do cartão atual e devolve o placar atualizado. */
  function avaliar(nota: NotaRevisao) {
    const acertou = nota !== 'errei';
    if (acertou) feedback.acerto();
    else feedback.erro();
    setHumor(nota === 'errei' ? 'triste' : nota === 'dificil' ? 'surpreso' : 'feliz');
    setFala(sortear(FALAS[nota]));

    if (rodada === 0 && devidos.has(cartao.id)) {
      revisar.mutate({ id: cartao.id, nota });
    }

    const placar = { acertos: acertos + (acertou ? 1 : 0), erros: erros + (acertou ? 0 : 1) };
    setAcertos(placar.acertos);
    setErros(placar.erros);
    return placar;
  }

  async function avancar(placar = { acertos, erros }) {
    if (indice + 1 < ordem.length) {
      rotacao.value = 0;
      setVirado(false);
      setResposta('');
      setAvaliacao(null);
      setIndice(indice + 1);
      return;
    }
    const duracao = Math.round((Date.now() - inicio) / 1000);
    try {
      await salvar.mutateAsync({ baralhoId: baralho.id, ...placar, duracaoSegundos: duracao });
      setResultado({ duracao });
    } catch (e) {
      setResultado({ duracao, erro: mensagemDeErro(e) });
    }
  }

  // Modo "virar": o próprio usuário diz como foi.
  function responderVirando(nota: NotaRevisao) {
    avancar(avaliar(nota));
  }

  // Modo "digitar": o app corrige e mostra a resposta certa.
  function verificar() {
    const resultadoDigitado = avaliarResposta(resposta, cartao.verso);
    setAvaliacao(resultadoDigitado);
    avaliar(NOTA_DA_AVALIACAO[resultadoDigitado]);
    virar(true, false);
  }

  function recomecar() {
    rotacao.value = 0;
    setOrdem(embaralhar(cartoes));
    setIndice(0);
    setVirado(false);
    setAcertos(0);
    setErros(0);
    setInicio(Date.now());
    setResultado(null);
    setResposta('');
    setAvaliacao(null);
    setHumor('neutro');
    setFala('Bora de novo! 💪');
    setRodada(rodada + 1);
  }

  if (resultado) {
    return (
      <Resultado
        acertos={acertos}
        erros={erros}
        duracao={resultado.duracao}
        erro={resultado.erro}
        aoRecomecar={recomecar}
        aoConcluir={() => router.back()}
      />
    );
  }

  const salvando = salvar.isPending;

  return (
    <KeyboardAvoidingView
      style={styles.tela}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
    >
      <Stack.Screen options={{ title: baralho.titulo }} />

      {/* O Lingo acompanha a sessão e reage às respostas. */}
      <View style={styles.mascote}>
        <Lingo humor={humor} tamanho={64} />
        <Animated.View key={fala} entering={FadeIn.duration(200)} style={styles.balao}>
          <View style={styles.balaoPonta} />
          <Text style={styles.balaoTexto}>{fala}</Text>
        </Animated.View>
      </View>

      <View style={styles.progresso}>
        <Text style={{ color: cores.textoSuave }}>
          {indice + 1} de {ordem.length}
        </Text>
        <Text style={{ color: cores.textoSuave }}>
          <Text style={{ color: cores.acerto }}>✓ {acertos}</Text>   <Text style={{ color: cores.erro }}>✗ {erros}</Text>
        </Text>
      </View>
      <ProgressBar progress={indice / ordem.length} style={styles.barra} />

      <Animated.View key={`${rodada}-${cartao.id}`} entering={entradaCarta} style={styles.area}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            // No modo digitar, a carta só vira depois de responder.
            if (!digitar || avaliacao) virar();
          }}
        >
          <Animated.View style={[styles.carta, frenteEstilo]}>
            <LinearGradient colors={degrades.carta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.preenchimento, styles.frente]}>
              <Text style={styles.rotuloCarta}>
                {baralho.idioma?.bandeira} {baralho.idioma?.nome}
              </Text>
              <Text variant="headlineLarge" style={styles.textoCarta}>
                {cartao.frente}
              </Text>
              {!digitar ? (
                <View style={styles.dica}>
                  <Icon source="gesture-tap" size={18} color={cores.textoSuave} />
                  <Text style={{ color: cores.textoSuave }}>Toque para virar</Text>
                </View>
              ) : null}
            </LinearGradient>
          </Animated.View>
          <Animated.View style={[styles.carta, versoEstilo]}>
            <LinearGradient colors={degrades.verso} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.preenchimento}>
              <Text style={[styles.rotuloCarta, { color: '#06201D' }]}>Tradução</Text>
              <Text variant="headlineLarge" style={[styles.textoCarta, { color: '#06201D' }]}>
                {cartao.verso}
              </Text>
              {cartao.exemplo ? <Text style={styles.exemplo}>“{cartao.exemplo}”</Text> : null}
            </LinearGradient>
          </Animated.View>
        </Pressable>
        {/* Pronúncia com a voz nativa do idioma */}
        <IconButton
          icon="volume-high"
          mode="contained-tonal"
          size={22}
          style={styles.falar}
          onPress={() => pronunciar(cartao.frente, codigoIdioma)}
          accessibilityLabel="Ouvir a pronúncia"
        />
      </Animated.View>

      {digitar ? (
        avaliacao ? (
          <View style={{ gap: 10 }}>
            <View style={[styles.veredito, { backgroundColor: `${COR_AVALIACAO[avaliacao]}22` }]}>
              <Text style={[styles.vereditoTexto, { color: COR_AVALIACAO[avaliacao] }]}>{TEXTO_AVALIACAO[avaliacao]}</Text>
              {avaliacao !== 'certa' && resposta.trim() ? (
                <Text style={{ color: cores.textoSuave }}>Você digitou: “{resposta.trim()}”</Text>
              ) : null}
            </View>
            <Button mode="contained" icon="arrow-right" contentStyle={styles.botaoConteudo} style={styles.botaoUnico} loading={salvando} disabled={salvando} onPress={() => avancar()}>
              {indice + 1 < ordem.length ? 'Próximo' : 'Ver resultado'}
            </Button>
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <TextInput
              key={`${rodada}-${cartao.id}`}
              mode="outlined"
              label="Sua resposta"
              value={resposta}
              onChangeText={setResposta}
              autoFocus
              autoCapitalize="none"
              autoCorrect={false}
              returnKeyType="done"
              onSubmitEditing={verificar}
            />
            <View style={styles.botoes}>
              <Button mode="text" style={styles.botao} onPress={verificar}>
                Não sei
              </Button>
              <Button mode="contained" icon="check" style={[styles.botao, { flex: 2 }]} contentStyle={styles.botaoConteudo} disabled={!resposta.trim()} onPress={verificar}>
                Verificar
              </Button>
            </View>
          </View>
        )
      ) : (
        <View style={styles.botoes}>
          {virado ? (
            <>
              <Button mode="contained" buttonColor={cores.erro} textColor="#2B0710" style={styles.botao} contentStyle={styles.botaoConteudo} disabled={salvando} onPress={() => responderVirando('errei')}>
                Errei
              </Button>
              <Button mode="contained" buttonColor={cores.destaque} textColor="#2A1E00" style={styles.botao} contentStyle={styles.botaoConteudo} disabled={salvando} onPress={() => responderVirando('dificil')}>
                Difícil
              </Button>
              <Button mode="contained" buttonColor={cores.acerto} textColor="#05200F" style={styles.botao} contentStyle={styles.botaoConteudo} loading={salvando} disabled={salvando} onPress={() => responderVirando('acertei')}>
                Acertei
              </Button>
            </>
          ) : (
            <Button mode="contained-tonal" icon="rotate-3d-variant" style={styles.botao} contentStyle={styles.botaoConteudo} onPress={() => virar(true)}>
              Mostrar resposta
            </Button>
          )}
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const COR_AVALIACAO: Record<Avaliacao, string> = { certa: cores.acerto, quase: cores.destaque, errada: cores.erro };
const TEXTO_AVALIACAO: Record<Avaliacao, string> = {
  certa: 'Resposta certa!',
  quase: 'Quase! Confira a escrita.',
  errada: 'Não foi dessa vez.',
};

type ResultadoProps = {
  acertos: number;
  erros: number;
  duracao: number;
  erro?: string;
  aoRecomecar: () => void;
  aoConcluir: () => void;
};

function Resultado({ acertos, erros, duracao, erro, aoRecomecar, aoConcluir }: ResultadoProps) {
  const p = percentual(acertos, erros);
  const excelente = p >= 90;
  const humor: Humor = excelente ? 'comemorando' : p >= 70 ? 'feliz' : p >= 50 ? 'neutro' : 'triste';
  const mensagem = excelente ? 'Excelente! 🎉' : p >= 70 ? 'Muito bem! 💪' : p >= 50 ? 'Bom caminho! 📚' : 'Continue praticando! 🌱';

  useEffect(() => {
    feedback.conclusao();
  }, []);

  return (
    <View style={styles.resultado}>
      <Stack.Screen options={{ title: 'Resultado' }} />
      <Entrada style={{ alignItems: 'center', gap: 4 }}>
        <Lingo humor={humor} tamanho={130} />
        <Text variant="headlineMedium" style={{ fontWeight: '800' }}>
          {mensagem}
        </Text>
      </Entrada>

      <Entrada indice={1}>
        <AnelProgresso valor={p / 100}>
          <Text variant="displaySmall" style={{ fontWeight: '800', color: cores.texto }}>
            {p}%
          </Text>
          <Text style={{ color: cores.textoSuave }}>de acerto</Text>
        </AnelProgresso>
      </Entrada>

      <Entrada indice={2} style={styles.placar}>
        <View style={[styles.pilula, { backgroundColor: `${cores.acerto}22` }]}>
          <Text style={{ color: cores.acerto, fontSize: 16, fontWeight: '700' }}>✓ {acertos} acertos</Text>
        </View>
        <View style={[styles.pilula, { backgroundColor: `${cores.erro}22` }]}>
          <Text style={{ color: cores.erro, fontSize: 16, fontWeight: '700' }}>✗ {erros} erros</Text>
        </View>
      </Entrada>

      <Entrada indice={3} style={{ alignItems: 'center', gap: 4 }}>
        <Text style={{ color: cores.textoSuave }}>Tempo: {formatarDuracao(duracao)}</Text>
        {erro ? (
          <Text style={{ color: cores.erro, textAlign: 'center' }}>Não foi possível salvar a sessão: {erro}</Text>
        ) : (
          <Text style={{ color: cores.textoSuave, textAlign: 'center' }}>
            Sessão salva. Os cartões que você errou voltam amanhã; os que acertou, mais para frente.
          </Text>
        )}
      </Entrada>

      <Entrada indice={4} style={styles.botoesFinais}>
        <Button mode="contained" icon="restart" contentStyle={styles.botaoConteudo} style={brilho(cores.primaria)} onPress={aoRecomecar}>
          Estudar de novo
        </Button>
        <Button mode="outlined" contentStyle={styles.botaoConteudo} onPress={aoConcluir}>
          Concluir
        </Button>
      </Entrada>

      {excelente ? <Confete /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: 20, paddingTop: 12, paddingBottom: 36, gap: 12 },
  mascote: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  balao: { flex: 1, backgroundColor: cores.superficieAlta, borderRadius: 16, paddingVertical: 10, paddingHorizontal: 14, ...sombra },
  balaoPonta: {
    position: 'absolute',
    left: -6,
    top: '50%',
    marginTop: -6,
    width: 12,
    height: 12,
    backgroundColor: cores.superficieAlta,
    transform: [{ rotate: '45deg' }],
  },
  balaoTexto: { color: cores.texto, fontWeight: '600' },
  progresso: { flexDirection: 'row', justifyContent: 'space-between' },
  barra: { height: 6, borderRadius: 3 },
  area: { flex: 1, marginVertical: 6, minHeight: 160 },
  carta: { ...StyleSheet.absoluteFill, borderRadius: 28, backfaceVisibility: 'hidden', ...sombra },
  preenchimento: { flex: 1, borderRadius: 28, backfaceVisibility: 'hidden', padding: 28, alignItems: 'center', justifyContent: 'center', gap: 16 },
  frente: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rotuloCarta: { position: 'absolute', top: 24, color: cores.textoSuave, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  textoCarta: { color: cores.texto, fontWeight: '800', textAlign: 'center' },
  exemplo: { color: '#0D3B36', fontStyle: 'italic', textAlign: 'center', fontSize: 16 },
  dica: { position: 'absolute', bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 6 },
  falar: { position: 'absolute', top: 10, right: 10 },
  botoes: { flexDirection: 'row', gap: 10 },
  botao: { flex: 1, borderRadius: 16 },
  botaoUnico: { borderRadius: 16 },
  botaoConteudo: { paddingVertical: 8 },
  veredito: { borderRadius: 16, padding: 14, gap: 4, alignItems: 'center' },
  vereditoTexto: { fontWeight: '800', fontSize: 17 },
  resultado: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  placar: { flexDirection: 'row', gap: 10 },
  pilula: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  botoesFinais: { alignSelf: 'stretch', gap: 10, marginTop: 6 },
});
