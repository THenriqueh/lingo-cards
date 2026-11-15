export type Usuario = { id: number; nome: string; email: string; criadoEm: string };

export type Idioma = {
  id: number;
  nome: string;
  codigo: string;
  bandeira: string;
  criadoEm: string;
  totalBaralhos?: number;
};

export type Cartao = {
  id: number;
  baralhoId: number;
  frente: string;
  verso: string;
  exemplo: string | null;
  // Repetição espaçada (calculada pela API)
  facilidade: number;
  intervaloDias: number;
  repeticoes: number;
  proximaRevisao: string;
  criadoEm: string;
};

/** Como o usuário se saiu num cartão; a API usa isso para agendar a próxima revisão. */
export type NotaRevisao = 'errei' | 'dificil' | 'acertei' | 'facil';

export type Baralho = {
  id: number;
  idiomaId: number;
  titulo: string;
  descricao: string;
  nivel: string;
  criadoEm: string;
  atualizadoEm: string;
  idioma?: Idioma;
  totalCartoes?: number;
  paraRevisar?: number;
  /** Quando vence a próxima revisão do baralho (lista de baralhos). */
  proximaRevisao?: string | null;
  /** Cartões com intervalo de 3 semanas ou mais (lista de baralhos). */
  dominados?: number;
  cartoes?: Cartao[];
};

export type Sessao = {
  id: number;
  baralhoId: number;
  acertos: number;
  erros: number;
  duracaoSegundos: number;
  realizadaEm: string;
  baralho?: { id: number; titulo: string };
};

export type Estatisticas = {
  totalIdiomas: number;
  totalBaralhos: number;
  totalCartoes: number;
  totalSessoes: number;
  revisoesPendentes: number;
  cartoesDominados: number;
  diasEstudados: number;
  minutosEstudados: number;
  taxaAcerto: number | null;
};

export type IdiomaInput = Pick<Idioma, 'nome' | 'codigo' | 'bandeira'>;
export type BaralhoInput = Pick<Baralho, 'idiomaId' | 'titulo' | 'descricao' | 'nivel'>;
export type CartaoInput = Pick<Cartao, 'baralhoId' | 'frente' | 'verso' | 'exemplo'>;
export type SessaoInput = Pick<Sessao, 'baralhoId' | 'acertos' | 'erros' | 'duracaoSegundos'>;
