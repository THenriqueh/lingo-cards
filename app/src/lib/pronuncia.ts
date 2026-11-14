// Vozes do sistema por idioma. Códigos que não estão aqui são passados como vieram.
const VOZES: Record<string, string> = {
  de: 'de-DE',
  en: 'en-US',
  es: 'es-ES',
  fr: 'fr-FR',
  it: 'it-IT',
  ja: 'ja-JP',
  ko: 'ko-KR',
  zh: 'zh-CN',
  ru: 'ru-RU',
  pt: 'pt-BR',
  nl: 'nl-NL',
};

/** Fala o texto com a voz nativa do idioma (sintetizador do próprio celular). */
export function pronunciar(texto: string, codigoIdioma?: string) {
  try {
    const Speech = require('expo-speech') as typeof import('expo-speech');
    Speech.stop();
    const codigo = (codigoIdioma ?? '').toLowerCase();
    Speech.speak(texto, { language: VOZES[codigo] ?? codigo, rate: 0.9 });
  } catch (erro) {
    console.warn('Pronúncia indisponível neste aparelho.', erro);
  }
}
