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
