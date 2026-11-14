import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

export const cores = {
  fundo: '#0B0F1D',
  superficie: '#151A2D',
  superficieAlta: '#1E2542',
  borda: '#2A3356',
  texto: '#ECEFFA',
  textoSuave: '#98A1C0',
  primaria: '#8B7CFF',
  secundaria: '#4FD1C5',
  acerto: '#3DD68C',
  erro: '#FF6B81',
  destaque: '#FFC94D',
  rosa: '#FF7AC6',
};

// Degradês usados em cartões e fundos (do canto superior esquerdo ao inferior direito).
export const degrades = {
  primaria: ['#A193FF', '#6C5CE7'] as const,
  verso: ['#6EE7DA', '#2BB3A6'] as const,
  carta: ['#28305A', '#1A2039'] as const,
  brilhoFundo: ['rgba(139,124,255,0.20)', 'rgba(139,124,255,0)'] as const,
};

// Sombras que dão profundidade (iOS usa shadow*, Android usa elevation).
export const sombra = {
  shadowColor: '#000',
  shadowOpacity: 0.35,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 8 },
  elevation: 6,
};

// Cartão com sombra e um contorno claro bem sutil, para "descolar" do fundo.
export const cartaoProfundo = {
  ...sombra,
  borderWidth: 1,
  borderColor: 'rgba(255,255,255,0.06)',
};

export function brilho(cor: string) {
  return { shadowColor: cor, shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 10 }, elevation: 10 };
}

export const tema: MD3Theme = {
  ...MD3DarkTheme,
  roundness: 4,
  colors: {
    ...MD3DarkTheme.colors,
    primary: cores.primaria,
    onPrimary: '#14102E',
    primaryContainer: '#2D2763',
    onPrimaryContainer: '#E3DFFF',
    secondary: cores.secundaria,
    onSecondary: '#06201D',
    secondaryContainer: '#123C38',
    onSecondaryContainer: '#C9F5EF',
    background: cores.fundo,
    surface: cores.superficie,
    surfaceVariant: cores.superficieAlta,
    onSurface: cores.texto,
    onSurfaceVariant: cores.textoSuave,
    outline: cores.borda,
    outlineVariant: cores.borda,
    error: cores.erro,
    elevation: {
      ...MD3DarkTheme.colors.elevation,
      level1: cores.superficie,
      level2: cores.superficieAlta,
      level3: cores.superficieAlta,
    },
  },
};

export const NIVEIS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;
export type Nivel = (typeof NIVEIS)[number];
