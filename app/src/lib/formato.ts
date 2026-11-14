export function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatarDuracao(segundos: number) {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return m > 0 ? `${m} min ${s.toString().padStart(2, '0')} s` : `${s} s`;
}

export function percentual(acertos: number, erros: number) {
  const total = acertos + erros;
  return total > 0 ? Math.round((acertos / total) * 100) : 0;
}

export function plural(n: number, singular: string, pluralForma: string) {
  return `${n} ${n === 1 ? singular : pluralForma}`;
}

/** "hoje", "amanhã", "em 6 dias"… para a próxima revisão de um cartão. */
export function quandoRevisar(iso: string) {
  const dias = Math.ceil((new Date(iso).getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (dias <= 0) return 'revisar hoje';
  if (dias === 1) return 'revisar amanhã';
  return `revisar em ${dias} dias`;
}

/** Cartões cuja revisão já venceu. */
export function pendentes<T extends { proximaRevisao: string }>(cartoes: T[]) {
  const agora = Date.now();
  return cartoes.filter((c) => new Date(c.proximaRevisao).getTime() <= agora);
}
