// Bandeira em emoji para cada idioma. Usa a escolhida no cadastro; se não houver, deduz pelo código.
const POR_CODIGO: Record<string, string> = {
  de: '🇩🇪',
  en: '🇬🇧',
  es: '🇪🇸',
  fr: '🇫🇷',
  it: '🇮🇹',
  ja: '🇯🇵',
  ru: '🇷🇺',
  ko: '🇰🇷',
  zh: '🇨🇳',
  nl: '🇳🇱',
  pt: '🇧🇷',
};

export function bandeiraDe(idioma?: { codigo?: string; bandeira?: string } | null) {
  if (!idioma) return '🌐';
  if (idioma.bandeira && idioma.bandeira !== '🌐') return idioma.bandeira;
  return POR_CODIGO[(idioma.codigo ?? '').toLowerCase()] ?? '🌐';
}

/** Idiomas sugeridos para adicionar com um toque. */
export const SUGESTOES_IDIOMA = [
  { nome: 'Inglês', codigo: 'en', bandeira: '🇬🇧' },
  { nome: 'Espanhol', codigo: 'es', bandeira: '🇪🇸' },
  { nome: 'Francês', codigo: 'fr', bandeira: '🇫🇷' },
  { nome: 'Alemão', codigo: 'de', bandeira: '🇩🇪' },
  { nome: 'Italiano', codigo: 'it', bandeira: '🇮🇹' },
  { nome: 'Russo', codigo: 'ru', bandeira: '🇷🇺' },
  { nome: 'Japonês', codigo: 'ja', bandeira: '🇯🇵' },
  { nome: 'Coreano', codigo: 'ko', bandeira: '🇰🇷' },
];
