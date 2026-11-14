// Repetição espaçada baseada no algoritmo SM-2 (Piotr Woźniak, SuperMemo).
// Cada resposta ajusta a "facilidade" do cartão e define quando ele deve voltar:
// o que você domina aparece cada vez menos; o que você erra volta em 10 minutos.

export const NOTAS = ['errei', 'dificil', 'acertei', 'facil'] as const;
export type Nota = (typeof NOTAS)[number];

// Qualidade da resposta na escala do SM-2 (0 a 5).
const QUALIDADE: Record<Nota, number> = { errei: 1, dificil: 3, acertei: 4, facil: 5 };

const DIA_MS = 24 * 60 * 60 * 1000;
const REAPRENDER_MS = 10 * 60 * 1000;

export type EstadoRevisao = { facilidade: number; intervaloDias: number; repeticoes: number };

export function calcularRevisao(atual: EstadoRevisao, nota: Nota, agora = new Date()) {
  const q = QUALIDADE[nota];
  let { repeticoes, intervaloDias } = atual;

  if (q < 3) {
    // Errou: recomeça a sequência e o cartão volta daqui a 10 minutos (reaprender).
    repeticoes = 0;
    intervaloDias = 0;
  } else {
    repeticoes += 1;
    if (repeticoes === 1) intervaloDias = nota === 'facil' ? 4 : 1;
    else if (repeticoes === 2) intervaloDias = nota === 'facil' ? 8 : 6;
    else intervaloDias = Math.round(intervaloDias * atual.facilidade);
  }

  const facilidade = Math.max(1.3, atual.facilidade + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)));

  return {
    facilidade: Math.round(facilidade * 100) / 100,
    intervaloDias,
    repeticoes,
    proximaRevisao: new Date(agora.getTime() + (q < 3 ? REAPRENDER_MS : intervaloDias * DIA_MS)),
  };
}
