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

const DIAS = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];
const MESES = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

/** "SEX, 14 NOV" */
export function dataCurta(data = new Date()) {
  return `${DIAS[data.getDay()]}, ${data.getDate()} ${MESES[data.getMonth()]}`;
}

/** Diferença em dias de calendário entre hoje e a data (0 = hoje, 1 = amanhã). */
export function diasDeCalendario(iso: string) {
  const alvo = new Date(iso);
  const hoje = new Date();
  const a = new Date(alvo.getFullYear(), alvo.getMonth(), alvo.getDate()).getTime();
  const b = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate()).getTime();
  return Math.round((a - b) / (24 * 60 * 60 * 1000));
}

/** "agora", "em 10 min", "hoje", "amanhã", "em 6 dias" */
export function emQuantosDias(iso: string | null | undefined) {
  if (!iso) return '';
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'agora';
  if (ms < 60 * 60 * 1000) return `em ${Math.ceil(ms / 60000)} min`;
  const dias = diasDeCalendario(iso);
  if (dias <= 0) return 'hoje';
  if (dias === 1) return 'amanhã';
  return `em ${dias} dias`;
}

/** "visto há 4 dias", a partir do agendamento atual do cartão. */
export function vistoHa(c: { repeticoes: number; intervaloDias: number; proximaRevisao: string }) {
  if (c.repeticoes === 0 && c.intervaloDias === 0) return 'novo';
  const ultima = new Date(c.proximaRevisao).getTime() - c.intervaloDias * 24 * 60 * 60 * 1000;
  const dias = Math.max(0, Math.floor((Date.now() - ultima) / (24 * 60 * 60 * 1000)));
  return dias === 0 ? 'visto hoje' : dias === 1 ? 'visto ontem' : `visto há ${dias} dias`;
}

/** Intervalo em texto curto para os botões de resposta: "amanhã", "6 dias". */
export function intervaloCurto(dias: number) {
  if (dias <= 0) return '10 min';
  return dias === 1 ? '1 dia' : `${dias} dias`;
}

/** Chave do dia no fuso local: "2026-11-14". */
export function chaveDoDia(data: Date) {
  return `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}-${String(data.getDate()).padStart(2, '0')}`;
}

/** Os 7 dias da semana atual, de domingo a sábado. */
export function diasDaSemana(hoje = new Date()) {
  const domingo = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate() - hoje.getDay());
  return Array.from({ length: 7 }, (_, i) => new Date(domingo.getFullYear(), domingo.getMonth(), domingo.getDate() + i));
}

export const INICIAIS_DIAS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

/** Dias seguidos com estudo, contando até hoje (ou até ontem, se hoje ainda não estudou). */
export function sequenciaDeDias(diasEstudados: Set<string>, hoje = new Date()) {
  const dia = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  if (!diasEstudados.has(chaveDoDia(dia))) dia.setDate(dia.getDate() - 1);
  let n = 0;
  while (diasEstudados.has(chaveDoDia(dia))) {
    n++;
    dia.setDate(dia.getDate() - 1);
  }
  return n;
}

/** "9s", "51s", "3min" */
export function duracaoCurta(segundos: number) {
  return segundos < 60 ? `${segundos}s` : `${Math.round(segundos / 60)}min`;
}

/** "20:35" */
export function hora(iso: string) {
  const d = new Date(iso);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

const MESES_CURTOS = ['JAN', 'FEV', 'MAR', 'ABR', 'MAI', 'JUN', 'JUL', 'AGO', 'SET', 'OUT', 'NOV', 'DEZ'];

/** "HOJE · 14 NOV", "ONTEM", "12 NOV" */
export function rotuloDoDia(iso: string) {
  const d = new Date(iso);
  const dias = diasDeCalendario(iso);
  const data = `${d.getDate()} ${MESES_CURTOS[d.getMonth()]}`;
  if (dias === 0) return `HOJE · ${data}`;
  if (dias === -1) return 'ONTEM';
  return data;
}

/** "NOV 2026" */
export function mesAno(iso: string) {
  const d = new Date(iso);
  return `${MESES_CURTOS[d.getMonth()]} ${d.getFullYear()}`;
}
