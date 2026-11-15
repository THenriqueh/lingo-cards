import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { type ReactNode, useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, IconButton, Text, TextInput } from 'react-native-paper';
import Animated, {
  Easing,
  FadeIn,
  interpolate,
  type SharedValue,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withSequence,
  withSpring,
  withTiming,
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
import { mensagemDeErro } from '@/api/client';
import { useBaralho, useRevisarCartao, useSalvarSessao } from '@/api/hooks';
import type { Baralho, Cartao, NotaRevisao } from '@/api/tipos';
import { BotaoPrincipal } from '@/components/BotaoPrincipal';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Lingo, type Humor } from '@/components/Lingo';
import { bandeiraDe } from '@/lib/bandeiras';
import { feedback } from '@/lib/feedback';
import { intervaloCurto, pendentes, percentual, vistoHa } from '@/lib/formato';
import { pronunciar } from '@/lib/pronuncia';
import { preverIntervalo } from '@/lib/repeticao';
import { avaliarResposta, type Avaliacao } from '@/lib/resposta';
import { usePreferencias } from '@/store/preferencias';
import { brilho, cores, fontes, rotulo } from '@/theme';

function embaralhar<T>(lista: T[]) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

// Cada carta nova surge com um leve fade.
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

const VIRADA = { duration: 600, easing: Easing.bezier(0.3, 1.4, 0.5, 1) };
const NOTA_DA_AVALIACAO: Record<Avaliacao, NotaRevisao> = { certa: 'acertei', quase: 'dificil', errada: 'errei' };

/** O que o Lingo diz depois de cada resposta. */
function falaDaResposta(nota: NotaRevisao, dias: number | null) {
  if (dias == null) return nota === 'errei' ? 'Tranquilo, errar faz parte.' : 'Boa!';
  if (nota === 'errei') return 'Tranquilo — ela volta em 10 minutos.';
  if (nota === 'dificil') return `Quase! Ela volta ${dias <= 1 ? 'amanhã' : `em ${dias} dias`}.`;
  return dias <= 1 ? 'Boa! Ela volta amanhã para fixar.' : `Boa! Ela volta só daqui a ${dias} dias.`;
}

function falaInicial(c: Cartao) {
  const visto = vistoHa(c);
  return visto === 'novo' ? 'Essa é nova. Vamos ver?' : `Você viu essa ${visto.replace('visto ', '')}. Lembra?`;
}

export default function Estudar() {
  const { id, modo } = useLocalSearchParams<{ id: string; modo?: 'revisao' | 'todos' }>();
  const baralho = useBaralho(Number(id));
  // A fila é decidida uma vez: depois de salvar, o baralho é recarregado e não pode mudar a sessão em andamento.
  const [fila, setFila] = useState<{ cartoes: Cartao[]; revisao: boolean } | null>(null);

  // A sessão tem cabeçalho próprio; os estados vazios e de erro usam o cabeçalho padrão, com "voltar".
  const comCabecalho = (conteudo: ReactNode) => (
    <>
      <Stack.Screen options={{ headerShown: true, title: '' }} />
      {conteudo}
    </>
  );

  if (baralho.isPending) return <Carregando />;
  if (baralho.isError) return comCabecalho(<Erro erro={baralho.error} aoTentarDeNovo={baralho.refetch} />);

  const todos = baralho.data.cartoes ?? [];
  if (fila === null) {
    const revisao = modo === 'revisao';
    setFila({ cartoes: revisao ? pendentes(todos) : todos, revisao });
    return <Carregando />;
  }

  if (!todos.length) return comCabecalho(<Vazio humor="triste" titulo="Baralho vazio" texto="Adicione cartões antes de estudar." />);
  if (!fila.cartoes.length) {
    return comCabecalho(
      <Vazio
        humor="comemorando"
        titulo="Tudo revisado por hoje!"
        texto="Os cartões deste baralho só voltam quando estiverem perto de ser esquecidos."
        acao={{ rotulo: 'Estudar todos mesmo assim', icone: 'cards-playing-outline', aoPressionar: () => setFila({ cartoes: todos, revisao: false }) }}
      />,
    );
  }
  return <Sessao key={`${fila.revisao}`} baralho={baralho.data} cartoes={fila.cartoes} />;
}

type Placar = { acertei: number; dificil: number; errei: number };
const PLACAR_ZERADO: Placar = { acertei: 0, dificil: 0, errei: 0 };

function Sessao({ baralho, cartoes }: { baralho: Baralho; cartoes: Cartao[] }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const salvar = useSalvarSessao();
  const revisar = useRevisarCartao();
  const digitar = usePreferencias((s) => s.modoResposta) === 'digitar';

  // Só os cartões com revisão vencida atualizam o agendamento (e só na primeira rodada).
  const [devidos] = useState(() => new Set(pendentes(cartoes).map((c) => c.id)));
  const [rodada, setRodada] = useState(0);
  const [ordem, setOrdem] = useState<Cartao[]>(() => embaralhar(cartoes));
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [placar, setPlacar] = useState<Placar>(PLACAR_ZERADO);
  const [agendados, setAgendados] = useState<number[]>([]);
  const [inicio, setInicio] = useState(() => Date.now());
  const [resultado, setResultado] = useState<{ duracao: number; erro?: string } | null>(null);
  const [humor, setHumor] = useState<Humor>('neutro');
  const [fala, setFala] = useState(() => falaInicial(ordem[0]));
  const [resposta, setResposta] = useState('');
  const [avaliacao, setAvaliacao] = useState<Avaliacao | null>(null);

  const rotacao = useSharedValue(0);
  const frenteEstilo = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(rotacao.value, [0, 1], [0, 180])}deg` }],
  }));
  const versoEstilo = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${interpolate(rotacao.value, [0, 1], [180, 360])}deg` }],
  }));

  const cartao = ordem[indice];
  const agenda = rodada === 0 && devidos.has(cartao.id);
  const bandeira = bandeiraDe(baralho.idioma);

  function virar(paraVerso = !virado) {
    if (paraVerso === virado) return;
    feedback.virar();
    rotacao.value = withTiming(paraVerso ? 1 : 0, VIRADA);
    setVirado(paraVerso);
  }

  function avaliar(nota: NotaRevisao) {
    if (nota === 'errei') feedback.erro();
    else feedback.acerto();
    setHumor(nota === 'errei' ? 'triste' : nota === 'dificil' ? 'surpreso' : 'feliz');

    const dias = agenda ? preverIntervalo(cartao, nota) : null;
    setFala(falaDaResposta(nota, dias));
    if (agenda) {
      revisar.mutate({ id: cartao.id, nota });
      setAgendados((a) => [...a, dias!]);
    }

    const chave = nota === 'facil' ? 'acertei' : nota;
    const novo = { ...placar, [chave]: placar[chave] + 1 };
    setPlacar(novo);
    return novo;
  }

  async function avancar(atual: Placar = placar) {
    if (indice + 1 < ordem.length) {
      rotacao.value = 0;
      setVirado(false);
      setResposta('');
      setAvaliacao(null);
      setIndice(indice + 1);
      return;
    }
    const duracao = Math.round((Date.now() - inicio) / 1000);
    const dados = { baralhoId: baralho.id, acertos: atual.acertei + atual.dificil, erros: atual.errei, duracaoSegundos: duracao };
    try {
      await salvar.mutateAsync(dados);
      setResultado({ duracao });
    } catch (e) {
      setResultado({ duracao, erro: mensagemDeErro(e) });
    }
  }

  function verificar() {
    const r = avaliarResposta(resposta, cartao.verso);
    setAvaliacao(r);
    avaliar(NOTA_DA_AVALIACAO[r]);
    virar(true);
  }

  function recomecar() {
    rotacao.value = 0;
    const nova = embaralhar(cartoes);
    setOrdem(nova);
    setIndice(0);
    setVirado(false);
    setPlacar(PLACAR_ZERADO);
    setAgendados([]);
    setInicio(Date.now());
    setResultado(null);
    setResposta('');
    setAvaliacao(null);
    setHumor('neutro');
    setFala('Bora de novo! Agora sem mexer na agenda.');
    setRodada(rodada + 1);
  }

  if (resultado) {
    return (
      <Resultado
        placar={placar}
        agendados={agendados}
        duracao={resultado.duracao}
        erro={resultado.erro}
        aoRecomecar={recomecar}
        aoConcluir={() => router.back()}
      />
    );
  }

  const salvando = salvar.isPending;

  return (
    <KeyboardAvoidingView style={[styles.tela, { paddingTop: insets.top + 6 }]} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.cabecalho}>
        <IconButton icon="close" size={22} iconColor={cores.textoSuave} onPress={() => router.back()} accessibilityLabel="Sair do estudo" />
        <Text style={rotulo} numberOfLines={1}>
          {bandeira} {baralho.idioma?.nome} · {baralho.nivel}
        </Text>
        <Text style={[rotulo, styles.contador]}>
          {String(indice + 1).padStart(2, '0')}/{String(ordem.length).padStart(2, '0')}
        </Text>
      </View>
      <View style={styles.trilho}>
        <View style={[styles.preenchido, { width: `${((indice + (avaliacao || virado ? 1 : 0)) / ordem.length) * 100}%` }]} />
      </View>

      <Animated.View key={`${rodada}-${cartao.id}`} entering={entradaCarta} style={styles.area}>
        <Pressable
          style={{ flex: 1 }}
          onPress={() => {
            // No modo digitar, a carta só vira depois de responder.
            if (!digitar || avaliacao) virar();
          }}
        >
          <Animated.View style={[styles.carta, styles.frente, frenteEstilo]}>
            <Text style={styles.rotuloCarta}>Frente · {vistoHa(cartao)}</Text>
            <Text style={styles.palavra}>{cartao.frente}</Text>
            {!digitar ? <Text style={[rotulo, styles.dica]}>toque para virar</Text> : null}
          </Animated.View>
          <Animated.View style={[styles.carta, styles.verso, versoEstilo]}>
            <Text style={[styles.rotuloCarta, { color: cores.limaTinta }]}>Verso</Text>
            <Text style={styles.traducao}>{cartao.verso}</Text>
            {cartao.exemplo ? <Text style={styles.exemplo}>“{cartao.exemplo}”</Text> : null}
          </Animated.View>
        </Pressable>
        <IconButton
          icon="volume-high"
          size={20}
          iconColor={virado ? cores.sobreCor : cores.texto2}
          style={styles.falar}
          onPress={() => pronunciar(cartao.frente, baralho.idioma?.codigo)}
          accessibilityLabel="Ouvir a pronúncia"
        />
      </Animated.View>

      <View style={styles.mascote}>
        <Lingo humor={humor} tamanho={34} />
        <Animated.Text key={fala} entering={FadeIn.duration(220)} style={styles.fala}>
          {fala}
        </Animated.Text>
      </View>

      {digitar ? (
        avaliacao ? (
          <View style={{ gap: 10 }}>
            <View style={[styles.veredito, { borderColor: COR_AVALIACAO[avaliacao] }]}>
              <Text style={[styles.vereditoTexto, { color: COR_AVALIACAO[avaliacao] }]}>{TEXTO_AVALIACAO[avaliacao]}</Text>
              {avaliacao !== 'certa' && resposta.trim() ? <Text style={rotulo}>você digitou: “{resposta.trim()}”</Text> : null}
            </View>
            <BotaoPrincipal rotulo={indice + 1 < ordem.length ? 'Próximo' : 'Ver resultado'} carregando={salvando} aoPressionar={() => avancar()} />
          </View>
        ) : (
          <View style={{ gap: 10 }}>
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
              outlineStyle={{ borderRadius: 16 }}
            />
            <View style={styles.respostas}>
              <Button mode="text" textColor={cores.textoSuave} onPress={verificar}>
                Não sei
              </Button>
              <BotaoPrincipal rotulo="Verificar" icone="check" desativado={!resposta.trim()} aoPressionar={verificar} style={{ flex: 1 }} />
            </View>
          </View>
        )
      ) : virado ? (
        <View style={styles.respostas}>
          <BotaoResposta tipo="errei" intervalo={agenda ? intervaloCurto(preverIntervalo(cartao, 'errei')) : '—'} desativado={salvando} aoPressionar={() => avancar(avaliar('errei'))} />
          <BotaoResposta tipo="dificil" intervalo={agenda ? intervaloCurto(preverIntervalo(cartao, 'dificil')) : '—'} desativado={salvando} aoPressionar={() => avancar(avaliar('dificil'))} />
          <BotaoResposta tipo="acertei" intervalo={agenda ? intervaloCurto(preverIntervalo(cartao, 'acertei')) : '—'} desativado={salvando} aoPressionar={() => avancar(avaliar('acertei'))} />
        </View>
      ) : (
        <BotaoResposta tipo="mostrar" intervalo="ou toque na carta" aoPressionar={() => virar(true)} />
      )}
    </KeyboardAvoidingView>
  );
}

// ---------- Botões de resposta ----------

type TipoBotao = 'errei' | 'dificil' | 'acertei' | 'mostrar';
const BOTAO: Record<TipoBotao, { rotulo: string; icone: string; cor: string; flex: number }> = {
  errei: { rotulo: 'Errei', icone: 'close', cor: cores.coral, flex: 1 },
  dificil: { rotulo: 'Difícil', icone: 'sine-wave', cor: cores.iris, flex: 1 },
  acertei: { rotulo: 'Acertei', icone: 'check', cor: cores.sobreCor, flex: 1.25 },
  mostrar: { rotulo: 'Mostrar resposta', icone: 'rotate-3d-variant', cor: cores.lima, flex: 1 },
};
const PressableAnimado = Animated.createAnimatedComponent(Pressable);
const MOLINHA = { duration: 150, easing: Easing.bezier(0.3, 1.6, 0.5, 1) };

function BotaoResposta({ tipo, intervalo, aoPressionar, desativado }: { tipo: TipoBotao; intervalo: string; aoPressionar: () => void; desativado?: boolean }) {
  const b = BOTAO[tipo];
  const escala = useSharedValue(1);
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));
  const lima = tipo === 'acertei';

  const conteudo = (
    <>
      <View style={styles.respostaLinha}>
        <Icon source={b.icone} size={16} color={b.cor} />
        <Text style={[styles.respostaRotulo, lima && { color: cores.sobreCor, fontFamily: fontes.titulo }]}>{b.rotulo}</Text>
      </View>
      <Text style={[styles.respostaIntervalo, lima && { color: cores.limaTinta }]}>{intervalo}</Text>
    </>
  );

  return (
    <PressableAnimado
      disabled={desativado}
      onPressIn={() => {
        escala.value = withTiming(0.94, MOLINHA);
      }}
      onPressOut={() => {
        escala.value = withTiming(1, MOLINHA);
      }}
      onPress={aoPressionar}
      style={[{ flex: b.flex }, estilo, lima && brilho(cores.lima)]}
    >
      {lima ? (
        <View style={[styles.resposta, styles.respostaLima]}>{conteudo}</View>
      ) : (
        <LinearGradient colors={['#23253A', '#191B2A']} style={[styles.resposta, styles.respostaEscura]}>
          {conteudo}
        </LinearGradient>
      )}
    </PressableAnimado>
  );
}

const COR_AVALIACAO: Record<Avaliacao, string> = { certa: cores.lima, quase: cores.iris, errada: cores.coral };
const TEXTO_AVALIACAO: Record<Avaliacao, string> = {
  certa: 'Resposta certa!',
  quase: 'Quase! Confira a escrita.',
  errada: 'Não foi dessa vez.',
};

// ---------- Resultado ----------

type ResultadoProps = {
  placar: Placar;
  agendados: number[];
  duracao: number;
  erro?: string;
  aoRecomecar: () => void;
  aoConcluir: () => void;
};

const RAIO = 80;
const TRACO = 14;
const LADO = (RAIO + TRACO) * 2;
const CirculoAnimado = Animated.createAnimatedComponent(Circle);

function Resultado({ placar, agendados, duracao, erro, aoRecomecar, aoConcluir }: ResultadoProps) {
  const insets = useSafeAreaInsets();
  const p = percentual(placar.acertei + placar.dificil, placar.errei);
  const humor: Humor = p >= 90 ? 'comemorando' : p >= 60 ? 'feliz' : p >= 40 ? 'pensando' : 'triste';
  const frase = p >= 90 ? 'Sua memória agradece.' : p >= 60 ? 'Boa sessão. Ela fica.' : p >= 40 ? 'Caminho certo. Eles voltam logo.' : 'Errar faz parte. Amanhã tem revanche.';
  const [numero, setNumero] = useState(0);
  const [completo, setCompleto] = useState(false);

  const circunferencia = 2 * Math.PI * RAIO;
  const progresso = useSharedValue(0);

  // 1. Anel preenche em 1,4 s e o número conta junto.
  useEffect(() => {
    feedback.conclusao();
    progresso.value = withTiming(p / 100, { duration: 1400, easing: Easing.out(Easing.poly(4)) });
    let quadro = 0;
    const t0 = Date.now();
    const passo = () => {
      const t = Math.min(1, (Date.now() - t0) / 1400);
      setNumero(Math.round(p * (1 - Math.pow(1 - t, 4))));
      if (t < 1) quadro = requestAnimationFrame(passo);
      else setCompleto(true);
    };
    quadro = requestAnimationFrame(passo);
    return () => cancelAnimationFrame(quadro);
  }, [p, progresso]);

  // Próxima revisão: o menor intervalo agendado nesta sessão.
  const menor = agendados.length ? Math.min(...agendados) : null;
  const naMesmaData = menor == null ? 0 : agendados.filter((d) => d === menor).length;
  const proxima =
    menor == null
      ? 'sessão livre · a agenda não mudou'
      : `próxima revisão: ${menor === 0 ? 'em 10 min' : menor === 1 ? 'amanhã' : `em ${menor} dias`} · ${naMesmaData} ${naMesmaData === 1 ? 'cartão' : 'cartões'}`;

  const min = Math.floor(duracao / 60);
  const seg = String(duracao % 60).padStart(2, '0');

  return (
    <View style={[styles.resultado, { paddingTop: insets.top + 14, paddingBottom: insets.bottom + 16 }]}>
      <Text style={[rotulo, { textAlign: 'center' }]}>Sessão concluída</Text>

      <View style={styles.anelArea}>
        {completo ? <Celebracao /> : null}
        <Anel progresso={progresso} circunferencia={circunferencia} />
        <View style={[StyleSheet.absoluteFill, styles.centro]}>
          <Text style={styles.porcentagem}>{numero}%</Text>
          <Text style={[rotulo, { textTransform: 'none' }]}>de acerto</Text>
        </View>
      </View>

      {completo ? (
        <MascoteComemora humor={humor} frase={frase} />
      ) : (
        <View style={{ height: 64 }} />
      )}

      <View style={styles.gradeResultado}>
        {[
          { valor: placar.acertei, legenda: 'Acertei', cor: cores.lima },
          { valor: placar.dificil, legenda: 'Difícil', cor: cores.iris },
          { valor: placar.errei, legenda: 'Errei', cor: cores.coral },
          { valor: `${min}:${seg}`, legenda: 'Tempo', cor: cores.texto },
        ].map((s, i) => (
          <Entrada key={s.legenda} atraso={1500 + i * 80} style={styles.celula}>
            <Text style={[styles.celulaValor, { color: s.cor }]}>{s.valor}</Text>
            <Text style={rotulo}>{s.legenda}</Text>
          </Entrada>
        ))}
      </View>

      <Entrada atraso={1900}>
        <Text style={[rotulo, styles.proxima]}>{erro ? `não foi possível salvar: ${erro}` : proxima}</Text>
      </Entrada>

      <View style={{ flex: 1 }} />
      <BotaoPrincipal rotulo="Concluir" aoPressionar={aoConcluir} />
      <Button mode="text" textColor={cores.textoSuave} onPress={aoRecomecar} style={{ marginTop: 4 }}>
        Estudar de novo
      </Button>
    </View>
  );
}

function Anel({ progresso, circunferencia }: { progresso: SharedValue<number>; circunferencia: number }) {
  const propsAnimadas = useAnimatedProps(() => ({ strokeDashoffset: circunferencia * (1 - progresso.value) }));

  return (
    <Svg width={LADO} height={LADO} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Circle cx={LADO / 2} cy={LADO / 2} r={RAIO} stroke={cores.superficie} strokeWidth={TRACO} fill="none" />
      <CirculoAnimado
        cx={LADO / 2}
        cy={LADO / 2}
        r={RAIO}
        stroke={cores.lima}
        strokeWidth={TRACO}
        strokeLinecap="round"
        fill="none"
        strokeDasharray={`${circunferencia} ${circunferencia}`}
        animatedProps={propsAnimadas}
      />
    </Svg>
  );
}

/** 2. Brilho, duas ondas saindo do anel e um ponto de luz dando a volta. */
function Celebracao() {
  const brilhoFundo = useSharedValue(0);
  const volta = useSharedValue(0);

  useEffect(() => {
    brilhoFundo.value = withSequence(withTiming(1, { duration: 400 }), withTiming(0.35, { duration: 800 }));
    volta.value = withTiming(1, { duration: 1100, easing: Easing.inOut(Easing.cubic) });
  }, [brilhoFundo, volta]);

  const estiloBrilho = useAnimatedStyle(() => ({ opacity: brilhoFundo.value }));
  const estiloVolta = useAnimatedStyle(() => ({
    opacity: volta.value < 0.9 ? 1 : (1 - volta.value) * 10,
    transform: [{ rotate: `${volta.value * 360}deg` }],
  }));

  return (
    <>
      <Animated.View style={[styles.brilhoAnel, estiloBrilho]} />
      <Onda atraso={0} />
      <Onda atraso={260} />
      <Animated.View style={[styles.voltaArea, estiloVolta]}>
        <View style={styles.pontoLuz} />
      </Animated.View>
    </>
  );
}

/** Onda que sai do anel e some (scale .95 → 1.55). */
function Onda({ atraso }: { atraso: number }) {
  const v = useSharedValue(0);
  useEffect(() => {
    v.value = withDelay(atraso, withTiming(1, { duration: 1000, easing: Easing.out(Easing.quad) }));
  }, [v, atraso]);
  const estilo = useAnimatedStyle(() => ({ opacity: 0.7 * (1 - v.value), transform: [{ scale: 0.95 + 0.6 * v.value }] }));
  return <Animated.View style={[styles.onda, estilo]} />;
}

/** 3. O Lingo entra com uma molinha. */
function MascoteComemora({ humor, frase }: { humor: Humor; frase: string }) {
  const t = useSharedValue(0);
  useEffect(() => {
    t.value = withSpring(1, { damping: 8, stiffness: 140 });
  }, [t]);
  const estilo = useAnimatedStyle(() => ({
    opacity: Math.min(1, t.value * 2),
    transform: [{ scale: 0.6 + 0.4 * t.value }, { rotate: `${-8 + 8 * t.value}deg` }],
  }));
  return (
    <Animated.View style={[styles.comemora, estilo]}>
      <Lingo humor={humor} tamanho={44} />
      <Text style={styles.frase}>{frase}</Text>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, paddingHorizontal: 20, paddingBottom: 28, gap: 12 },
  cabecalho: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: -10 },
  contador: { color: cores.lima, marginRight: 10, fontFamily: fontes.monoForte },
  trilho: { height: 4, borderRadius: 2, backgroundColor: cores.bordaSuave, overflow: 'hidden' },
  preenchido: { height: 4, borderRadius: 2, backgroundColor: cores.lima },
  area: { flex: 1, marginTop: 8, minHeight: 170 },
  carta: {
    ...StyleSheet.absoluteFill,
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    backfaceVisibility: 'hidden',
  },
  frente: { backgroundColor: cores.superficie, borderWidth: 1, borderColor: cores.borda },
  verso: { backgroundColor: cores.lima },
  rotuloCarta: { ...rotulo, position: 'absolute', top: 22 },
  palavra: { fontFamily: fontes.titulo, fontSize: 32, color: cores.texto, textAlign: 'center', letterSpacing: -0.8 },
  traducao: { fontFamily: fontes.titulo, fontSize: 32, color: cores.sobreCor, textAlign: 'center', letterSpacing: -0.8 },
  exemplo: { fontFamily: fontes.corpo, fontStyle: 'italic', fontSize: 16, color: cores.limaTinta, textAlign: 'center' },
  dica: { position: 'absolute', bottom: 22, textTransform: 'none' },
  falar: { position: 'absolute', top: 8, right: 8 },
  mascote: { flexDirection: 'row', alignItems: 'center', gap: 12, minHeight: 44 },
  fala: { flex: 1, fontFamily: fontes.semi, fontSize: 15, color: cores.texto2 },
  respostas: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  resposta: { height: 64, borderRadius: 18, alignItems: 'center', justifyContent: 'center', gap: 4 },
  respostaEscura: { borderWidth: 1, borderColor: cores.borda },
  respostaLima: { backgroundColor: cores.lima },
  respostaLinha: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  respostaRotulo: { fontFamily: fontes.negrito, fontSize: 16, color: cores.texto },
  respostaIntervalo: { fontFamily: fontes.mono, fontSize: 11, color: cores.textoSuave },
  veredito: { borderRadius: 16, borderWidth: 1, padding: 12, gap: 4, alignItems: 'center', backgroundColor: cores.superficie2 },
  vereditoTexto: { fontFamily: fontes.titulo, fontSize: 17 },
  resultado: { flex: 1, backgroundColor: cores.fundo, paddingHorizontal: 24, gap: 14 },
  anelArea: { width: LADO, height: LADO, alignSelf: 'center', marginTop: 8, alignItems: 'center', justifyContent: 'center' },
  centro: { alignItems: 'center', justifyContent: 'center' },
  porcentagem: { fontFamily: fontes.titulo, fontSize: 48, color: cores.texto, letterSpacing: -2 },
  brilhoAnel: {
    position: 'absolute',
    width: LADO * 0.9,
    height: LADO * 0.9,
    borderRadius: LADO,
    backgroundColor: 'rgba(198,244,50,0.10)',
    ...brilho(cores.lima),
    shadowRadius: 40,
    shadowOpacity: 0.8,
  },
  onda: { position: 'absolute', width: RAIO * 2 + TRACO, height: RAIO * 2 + TRACO, borderRadius: LADO, borderWidth: 2, borderColor: cores.lima },
  voltaArea: { position: 'absolute', width: RAIO * 2, height: RAIO * 2, alignItems: 'center' },
  pontoLuz: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: -5,
    backgroundColor: '#FFFFFF',
    shadowColor: cores.lima,
    shadowOpacity: 1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
  },
  comemora: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 12, minHeight: 64 },
  frase: { fontFamily: fontes.titulo, fontSize: 20, color: cores.texto, letterSpacing: -0.4, flexShrink: 1 },
  gradeResultado: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  celula: { width: '48.5%', backgroundColor: cores.superficie, borderRadius: 14, borderWidth: 1, borderColor: cores.bordaSuave, padding: 12, gap: 2 },
  celulaValor: { fontFamily: fontes.titulo, fontSize: 22 },
  proxima: { textAlign: 'center', textTransform: 'none' },
});
