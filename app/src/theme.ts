import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

// Identidade "Curva": instrumento científico escuro, dados em mono e um lima que marca cada acerto.
export const cores = {
  fundo: '#0B0C14',
  superficie: '#1C1E2E',
  superficie2: '#11121D',
  superficieAlta: '#1C1E2E',
  borda: '#2D3048',
  bordaSuave: '#23253A',
  texto: '#EDEEF5',
  texto2: '#C9CBDA',
  textoSuave: '#8A8DA6',
  // Marca
  lima: '#C6F432',
  limaTinta: '#3D4A0C',
  iris: '#8B7BFF',
  coral: '#FF5D73',
  /** Texto sobre lima, íris ou coral. */
  sobreCor: '#0B0C14',
  // Papéis
  primaria: '#C6F432',
  secundaria: '#8B7BFF',
  acerto: '#C6F432',
  erro: '#FF5D73',
  destaque: '#8B7BFF',
};

// Bricolage Grotesque para títulos e texto; JetBrains Mono para rótulos e números.
export const fontes = {
  titulo: 'BricolageGrotesque_800ExtraBold',
  negrito: 'BricolageGrotesque_700Bold',
  semi: 'BricolageGrotesque_600SemiBold',
  corpo: 'BricolageGrotesque_400Regular',
  mono: 'JetBrainsMono_500Medium',
  monoForte: 'JetBrainsMono_600SemiBold',
};

/** Rótulo em mono, caixa alta: "PARA REVISAR HOJE", "FRENTE · VISTO HÁ 4 DIAS". */
export const rotulo = {
  fontFamily: fontes.mono,
  fontSize: 11,
  letterSpacing: 1,
  textTransform: 'uppercase' as const,
  color: cores.textoSuave,
};

// Sombras: só o lima "brilha"; o resto é plano, com bordas de 1px.
export const sombra = {
  shadowColor: '#000',
  shadowOpacity: 0.3,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },
  elevation: 4,
};

export function brilho(cor: string) {
  return { shadowColor: cor, shadowOpacity: 0.55, shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8 };
}

/** Cartão padrão: superfície com borda de 1px. */
export const cartaoProfundo = {
  backgroundColor: cores.superficie,
  borderWidth: 1,
  borderColor: cores.borda,
  borderRadius: 16,
};

// Cada variante tipográfica do Paper usa um arquivo de fonte (o peso vem da fonte, não do fontWeight).
const FONTE_DA_VARIANTE: Record<string, string> = {
  display: fontes.titulo,
  headline: fontes.titulo,
  titleLarge: fontes.negrito,
  titleMedium: fontes.negrito,
  titleSmall: fontes.semi,
  label: fontes.negrito,
  body: fontes.corpo,
  default: fontes.corpo,
};

function fontesDoTema(): MD3Theme['fonts'] {
  const base = MD3DarkTheme.fonts as unknown as Record<string, object>;
  const resultado: Record<string, object> = {};
  for (const [variante, estilo] of Object.entries(base)) {
    const familia =
      FONTE_DA_VARIANTE[variante] ??
      Object.entries(FONTE_DA_VARIANTE).find(([prefixo]) => variante.startsWith(prefixo))?.[1] ??
      fontes.corpo;
    resultado[variante] = { ...estilo, fontFamily: familia, fontWeight: 'normal' };
  }
  return resultado as unknown as MD3Theme['fonts'];
}

export const tema: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 5,
  fonts: fontesDoTema(),
  colors: {
    ...MD3DarkTheme.colors,
    primary: cores.lima,
    onPrimary: cores.sobreCor,
    primaryContainer: '#2A3311',
    onPrimaryContainer: cores.lima,
    secondary: cores.iris,
    onSecondary: cores.sobreCor,
    secondaryContainer: '#25224A',
    onSecondaryContainer: '#D9D3FF',
    tertiary: cores.coral,
    background: cores.fundo,
    surface: cores.superficie,
    surfaceVariant: cores.superficie,
    onSurface: cores.texto,
    onSurfaceVariant: cores.texto2,
    outline: cores.borda,
    outlineVariant: cores.bordaSuave,
    error: cores.coral,
    onError: cores.sobreCor,
    inverseSurface: cores.texto,
    inverseOnSurface: cores.fundo,
    inversePrimary: cores.limaTinta,
    backdrop: 'rgba(5,6,12,0.7)',
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level0: 'transparent',
      level1: cores.superficie,
      level2: cores.superficie,
      level3: cores.superficie,
      level4: cores.superficie,
      level5: cores.superficie,
    },
  },
};

export const NIVEIS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Nivel = (typeof NIVEIS)[number];
