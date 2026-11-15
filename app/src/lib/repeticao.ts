import type { Cartao, NotaRevisao } from '@/api/tipos';

// Mesma regra do servidor (api/src/lib/repeticao.ts), usada só para PREVER o intervalo nos botões.
// Quem grava o agendamento de verdade é a API.
const QUALIDADE: Record<NotaRevisao, number> = { errei: 1, dificil: 3, acertei: 4, facil: 5 };

export function preverIntervalo(c: Pick<Cartao, 'facilidade' | 'intervaloDias' | 'repeticoes'>, nota: NotaRevisao) {
  if (QUALIDADE[nota] < 3) return 0; // volta em 10 minutos
  const repeticoes = c.repeticoes + 1;
  if (repeticoes === 1) return nota === 'facil' ? 4 : 1;
  if (repeticoes === 2) return nota === 'facil' ? 8 : nota === 'dificil' ? 3 : 6;
  if (nota === 'dificil') return Math.max(c.intervaloDias + 1, Math.round(c.intervaloDias * 1.2));
  return Math.round(c.intervaloDias * c.facilidade * (nota === 'facil' ? 1.3 : 1));
}
