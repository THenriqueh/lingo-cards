import { LinearGradient } from 'expo-linear-gradient';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, ProgressBar, Text } from 'react-native-paper';
import Animated, { FadeIn, interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { mensagemDeErro } from '@/api/client';
import { useBaralho, useSalvarSessao } from '@/api/hooks';
import type { Baralho, Cartao } from '@/api/tipos';
import { AnelProgresso } from '@/components/AnelProgresso';
import { Confete } from '@/components/Confete';
import { Entrada } from '@/components/Entrada';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { Lingo, type Humor } from '@/components/Lingo';
import { feedback } from '@/lib/feedback';
import { formatarDuracao, percentual } from '@/lib/formato';
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
const FALAS_ACERTO = ['Isso aí! 🎯', 'Mandou bem!', 'Perfeito!', 'Arrasou! ✨'];
const FALAS_ERRO = ['Quase! Na próxima vai.', 'Tudo bem, errar faz parte.', 'Anota essa! 📝'];

export default function Estudar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const baralho = useBaralho(Number(id));
  if (baralho.isPending) return <Carregando />;
  if (baralho.isError) return <Erro erro={baralho.error} aoTentarDeNovo={baralho.refetch} />;
  if (!baralho.data.cartoes?.length) return <Vazio humor="triste" titulo="Baralho vazio" texto="Adicione cartões antes de estudar." />;
  return <Sessao key={baralho.data.id} baralho={baralho.data} />;
}

function Sessao({ baralho }: { baralho: Baralho }) {
  const router = useRouter();
  const salvar = useSalvarSessao();
  const [rodada, setRodada] = useState(0);
  const [ordem, setOrdem] = useState<Cartao[]>(() => embaralhar(baralho.cartoes!));
  const [indice, setIndice] = useState(0);
  const [virado, setVirado] = useState(false);
  const [acertos, setAcertos] = useState(0);
  const [erros, setErros] = useState(0);
  const [inicio, setInicio] = useState(() => Date.now());
  const [resultado, setResultado] = useState<{ duracao: number; erro?: string } | null>(null);
  const [humor, setHumor] = useState<Humor>('neutro');
  const [fala, setFala] = useState('Vamos lá! Você sabe esta?');

  const rotacao = useSharedValue(0);
  const frenteEstilo = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotacao.value, [0, 1], [0, 180])}deg` }],
  }));
  const versoEstilo = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotacao.value, [0, 1], [180, 360])}deg` }],
  }));

  const cartao = ordem[indice];

  function virar() {
    feedback.virar();
    rotacao.value = withTiming(virado ? 0 : 1, { duration: 380 });
    if (!virado) {
      setHumor('pensando');
      setFala('E aí, acertou?');
    }
    setVirado(!virado);
  }

  async function responder(acertou: boolean) {
    if (acertou) {
      feedback.acerto();
      setHumor('feliz');
      setFala(sortear(FALAS_ACERTO));
    } else {
      feedback.erro();
      setHumor('triste');
      setFala(sortear(FALAS_ERRO));
    }
    const novosAcertos = acertos + (acertou ? 1 : 0);
    const novosErros = erros + (acertou ? 0 : 1);
    setAcertos(novosAcertos);
    setErros(novosErros);

    if (indice + 1 < ordem.length) {
      rotacao.value = 0;
      setVirado(false);
      setIndice(indice + 1);
      return;
    }

    const duracao = Math.round((Date.now() - inicio) / 1000);
    try {
      await salvar.mutateAsync({ baralhoId: baralho.id, acertos: novosAcertos, erros: novosErros, duracaoSegundos: duracao });
      setResultado({ duracao });
    } catch (e) {
      setResultado({ duracao, erro: mensagemDeErro(e) });
    }
  }

  function recomecar() {
    rotacao.value = 0;
    setOrdem(embaralhar(baralho.cartoes!));
    setIndice(0);
    setVirado(false);
    setAcertos(0);
    setErros(0);
    setInicio(Date.now());
    setResultado(null);
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

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ title: baralho.titulo }} />

      {/* O Lingo acompanha a sessão e reage às respostas. */}
      <View style={styles.mascote}>
        <Lingo humor={humor} tamanho={72} />
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
        <Pressable style={{ flex: 1 }} onPress={virar}>
          <Animated.View style={[styles.carta, frenteEstilo]}>
            <LinearGradient colors={degrades.carta} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={[styles.preenchimento, styles.frente]}>
              <Text style={styles.rotuloCarta}>
                {baralho.idioma?.bandeira} {baralho.idioma?.nome}
              </Text>
              <Text variant="headlineLarge" style={styles.textoCarta}>
                {cartao.frente}
              </Text>
              <View style={styles.dica}>
                <Icon source="gesture-tap" size={18} color={cores.textoSuave} />
                <Text style={{ color: cores.textoSuave }}>Toque para virar</Text>
              </View>
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
      </Animated.View>

      <View style={styles.botoes}>
        {virado ? (
          <>
            <Button mode="contained" icon="close" buttonColor={cores.erro} textColor="#2B0710" style={[styles.botao, brilho(cores.erro)]} contentStyle={styles.botaoConteudo} disabled={salvar.isPending} onPress={() => responder(false)}>
              Errei
            </Button>
            <Button mode="contained" icon="check" buttonColor={cores.acerto} textColor="#05200F" style={[styles.botao, brilho(cores.acerto)]} contentStyle={styles.botaoConteudo} loading={salvar.isPending} disabled={salvar.isPending} onPress={() => responder(true)}>
              Acertei
            </Button>
          </>
        ) : (
          <Button mode="contained-tonal" icon="rotate-3d-variant" style={styles.botao} contentStyle={styles.botaoConteudo} onPress={virar}>
            Mostrar resposta
          </Button>
        )}
      </View>
    </View>
  );
}

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
          <Text style={{ color: cores.textoSuave }}>Sessão salva no seu histórico.</Text>
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
  tela: { flex: 1, backgroundColor: cores.fundo, padding: 20, paddingTop: 12, paddingBottom: 40, gap: 12 },
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
  area: { flex: 1, marginVertical: 8 },
  carta: { ...StyleSheet.absoluteFill, borderRadius: 28, backfaceVisibility: 'hidden', ...sombra },
  preenchimento: { flex: 1, borderRadius: 28, backfaceVisibility: 'hidden', padding: 28, alignItems: 'center', justifyContent: 'center', gap: 16 },
  frente: { borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)' },
  rotuloCarta: { position: 'absolute', top: 24, color: cores.textoSuave, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  textoCarta: { color: cores.texto, fontWeight: '800', textAlign: 'center' },
  exemplo: { color: '#0D3B36', fontStyle: 'italic', textAlign: 'center', fontSize: 16 },
  dica: { position: 'absolute', bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 6 },
  botoes: { flexDirection: 'row', gap: 12 },
  botao: { flex: 1, borderRadius: 16 },
  botaoConteudo: { paddingVertical: 10 },
  resultado: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 14 },
  placar: { flexDirection: 'row', gap: 10 },
  pilula: { paddingVertical: 8, paddingHorizontal: 14, borderRadius: 999 },
  botoesFinais: { alignSelf: 'stretch', gap: 10, marginTop: 6 },
});
