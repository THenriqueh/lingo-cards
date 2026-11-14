// Correção da resposta digitada: tolera maiúsculas, pontuação e pequenos erros de digitação.
// Acento esquecido conta como "quase".

export type Avaliacao = 'certa' | 'quase' | 'errada';

/** "Olá, Mundo!" → "olá mundo" (mantém os acentos) */
function limpar(texto: string) {
  return texto
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** "olá mundo" → "ola mundo" */
function semAcentos(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Distância de Levenshtein: quantas letras precisam mudar para um texto virar o outro. */
export function distancia(a: string, b: string) {
  const linha = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    let diagonal = linha[0];
    linha[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const acima = linha[j];
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = acima;
    }
  }
  return linha[b.length];
}

/** O verso pode ter várias respostas aceitas: "ser, estar", "ser / estar" ou "ser ou estar". */
function respostasAceitas(verso: string) {
  return [verso, ...verso.split(/[,;/]|\sou\s/)].map(limpar).filter(Boolean);
}

export function avaliarResposta(digitado: string, verso: string): Avaliacao {
  const tentativa = limpar(digitado);
  if (!tentativa) return 'errada';
  const aceitas = respostasAceitas(verso);
  if (aceitas.includes(tentativa)) return 'certa';

  const tentativaSemAcento = semAcentos(tentativa);
  let menorErro = Infinity;
  for (const aceita of aceitas.map(semAcentos)) {
    if (aceita === tentativaSemAcento) return 'quase';
    menorErro = Math.min(menorErro, distancia(tentativaSemAcento, aceita) / aceita.length);
  }
  // Até 1 letra errada a cada 4 ainda é "quase" (erro de digitação).
  return menorErro <= 0.25 ? 'quase' : 'errada';
}
