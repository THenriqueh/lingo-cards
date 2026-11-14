import { MD3DarkTheme, type MD3Theme } from 'react-native-paper';

export const cores = {
  fundo: '#0E1220',
  superficie: '#161B2E',
  superficieAlta: '#1F2640',
  borda: '#2A3354',
  texto: '#ECEFFA',
  textoSuave: '#98A1C0',
  primaria: '#8B7CFF',
  secundaria: '#4FD1C5',
  acerto: '#3DD68C',
  erro: '#FF6B81',
  destaque: '#FFC94D',
};

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
