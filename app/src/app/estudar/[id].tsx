import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Button, Icon, ProgressBar, Text } from 'react-native-paper';
import Animated, { interpolate, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { mensagemDeErro } from '@/api/client';
import { useBaralho, useSalvarSessao } from '@/api/hooks';
import type { Baralho, Cartao } from '@/api/tipos';
import { Carregando, Erro, Vazio } from '@/components/Estados';
import { formatarDuracao, percentual } from '@/lib/formato';
import { cores } from '@/theme';

function embaralhar<T>(lista: T[]) {
  const copia = [...lista];
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default function Estudar() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const baralho = useBaralho(Number(id));
  if (baralho.isPending) return <Carregando />;
  if (baralho.isError) return <Erro erro={baralho.error} aoTentarDeNovo={baralho.refetch} />;
  if (!baralho.data.cartoes?.length) return <Vazio icone="cards-outline" titulo="Baralho vazio" texto="Adicione cartões antes de estudar." />;
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

  const rotacao = useSharedValue(0);
  const frenteEstilo = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotacao.value, [0, 1], [0, 180])}deg` }],
  }));
  const versoEstilo = useAnimatedStyle(() => ({
    transform: [{ perspective: 1000 }, { rotateY: `${interpolate(rotacao.value, [0, 1], [180, 360])}deg` }],
  }));

  const cartao = ordem[indice];

  function virar() {
    rotacao.value = withTiming(virado ? 0 : 1, { duration: 380 });
    setVirado(!virado);
  }

  async function responder(acertou: boolean) {
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
    setRodada(rodada + 1);
  }

  if (resultado) {
    const p = percentual(acertos, erros);
    const mensagem = p >= 90 ? 'Excelente! 🎉' : p >= 70 ? 'Muito bem! 💪' : p >= 50 ? 'Bom caminho! 📚' : 'Continue praticando! 🌱';
    return (
      <View style={styles.resultado}>
        <Stack.Screen options={{ title: 'Resultado' }} />
        <Text variant="headlineMedium" style={{ fontWeight: '800' }}>
          {mensagem}
        </Text>
        <View style={styles.circulo}>
          <Text variant="displayMedium" style={{ fontWeight: '800', color: cores.primaria }}>
            {p}%
          </Text>
          <Text style={{ color: cores.textoSuave }}>de acerto</Text>
        </View>
        <View style={styles.placar}>
          <Text style={{ color: cores.acerto, fontSize: 18, fontWeight: '700' }}>✓ {acertos} acertos</Text>
          <Text style={{ color: cores.erro, fontSize: 18, fontWeight: '700' }}>✗ {erros} erros</Text>
        </View>
        <Text style={{ color: cores.textoSuave }}>Tempo: {formatarDuracao(resultado.duracao)}</Text>
        {resultado.erro ? (
          <Text style={{ color: cores.erro, textAlign: 'center' }}>Não foi possível salvar a sessão: {resultado.erro}</Text>
        ) : (
          <Text style={{ color: cores.textoSuave }}>Sessão salva no seu histórico.</Text>
        )}
        <Button mode="contained" icon="restart" style={styles.botaoFinal} onPress={recomecar}>
          Estudar de novo
        </Button>
        <Button mode="outlined" style={styles.botaoFinal} onPress={() => router.back()}>
          Concluir
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.tela}>
      <Stack.Screen options={{ title: baralho.titulo }} />
      <View style={styles.progresso}>
        <Text style={{ color: cores.textoSuave }}>
          {indice + 1} de {ordem.length}
        </Text>
        <Text style={{ color: cores.textoSuave }}>
          <Text style={{ color: cores.acerto }}>✓ {acertos}</Text>   <Text style={{ color: cores.erro }}>✗ {erros}</Text>
        </Text>
      </View>
      <ProgressBar progress={indice / ordem.length} style={styles.barra} />

      <Pressable style={styles.area} onPress={virar} key={`${rodada}-${cartao.id}`}>
        <Animated.View style={[styles.carta, styles.frente, frenteEstilo]}>
          <Text style={styles.rotuloCarta}>{baralho.idioma?.bandeira} {baralho.idioma?.nome}</Text>
          <Text variant="headlineLarge" style={styles.textoCarta}>
            {cartao.frente}
          </Text>
          <View style={styles.dica}>
            <Icon source="gesture-tap" size={18} color={cores.textoSuave} />
            <Text style={{ color: cores.textoSuave }}>Toque para virar</Text>
          </View>
        </Animated.View>
        <Animated.View style={[styles.carta, styles.verso, versoEstilo]}>
          <Text style={[styles.rotuloCarta, { color: '#06201D' }]}>Tradução</Text>
          <Text variant="headlineLarge" style={[styles.textoCarta, { color: '#06201D' }]}>
            {cartao.verso}
          </Text>
          {cartao.exemplo ? <Text style={styles.exemplo}>“{cartao.exemplo}”</Text> : null}
        </Animated.View>
      </Pressable>

      <View style={styles.botoes}>
        {virado ? (
          <>
            <Button mode="contained" icon="close" buttonColor={cores.erro} textColor="#2B0710" style={styles.botao} contentStyle={styles.botaoConteudo} disabled={salvar.isPending} onPress={() => responder(false)}>
              Errei
            </Button>
            <Button mode="contained" icon="check" buttonColor={cores.acerto} textColor="#05200F" style={styles.botao} contentStyle={styles.botaoConteudo} loading={salvar.isPending} disabled={salvar.isPending} onPress={() => responder(true)}>
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

const styles = StyleSheet.create({
  tela: { flex: 1, backgroundColor: cores.fundo, padding: 20, paddingBottom: 40, gap: 12 },
  progresso: { flexDirection: 'row', justifyContent: 'space-between' },
  barra: { height: 6, borderRadius: 3 },
  area: { flex: 1, marginVertical: 12 },
  carta: {
    ...StyleSheet.absoluteFill,
    borderRadius: 28,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backfaceVisibility: 'hidden',
    gap: 16,
  },
  frente: { backgroundColor: cores.superficieAlta, borderWidth: 1, borderColor: cores.borda },
  verso: { backgroundColor: cores.secundaria },
  rotuloCarta: { position: 'absolute', top: 24, color: cores.textoSuave, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', fontSize: 12 },
  textoCarta: { color: cores.texto, fontWeight: '800', textAlign: 'center' },
  exemplo: { color: '#0D3B36', fontStyle: 'italic', textAlign: 'center', fontSize: 16 },
  dica: { position: 'absolute', bottom: 24, flexDirection: 'row', alignItems: 'center', gap: 6 },
  botoes: { flexDirection: 'row', gap: 12 },
  botao: { flex: 1, borderRadius: 16 },
  botaoConteudo: { paddingVertical: 10 },
  resultado: { flex: 1, backgroundColor: cores.fundo, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 12 },
  circulo: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 6,
    borderColor: cores.primaria,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 8,
  },
  placar: { flexDirection: 'row', gap: 24 },
  botaoFinal: { alignSelf: 'stretch' },
});
