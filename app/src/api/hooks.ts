import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './client';
import type {
  Baralho,
  BaralhoInput,
  Cartao,
  CartaoInput,
  Estatisticas,
  Idioma,
  IdiomaInput,
  NotaRevisao,
  Sessao,
  SessaoInput,
  Usuario,
} from './tipos';

// ---------- Chaves de cache ----------
export const chaves = {
  idiomas: ['idiomas'] as const,
  baralhos: (idiomaId?: number) => ['baralhos', { idiomaId }] as const,
  baralho: (id: number) => ['baralho', id] as const,
  cartao: (id: number) => ['cartao', id] as const,
  sessoes: ['sessoes'] as const,
  sessao: (id: number) => ['sessao', id] as const,
  estatisticas: ['estatisticas'] as const,
};

/** Depois de qualquer alteração, marca como desatualizadas as listas afetadas. */
function useInvalidar() {
  const qc = useQueryClient();
  return (...prefixos: string[]) =>
    Promise.all(prefixos.map((p) => qc.invalidateQueries({ queryKey: [p] })));
}

// ---------- Autenticação ----------
type RespostaAuth = { token: string; usuario: Usuario };

export const autenticacao = {
  login: (email: string, senha: string) => api.post<RespostaAuth>('/auth/login', { email, senha }).then((r) => r.data),
  cadastro: (nome: string, email: string, senha: string) =>
    api.post<RespostaAuth>('/auth/signup', { nome, email, senha }).then((r) => r.data),
  logout: () => api.post('/auth/logout'),
};

// ---------- Idiomas ----------
export const useIdiomas = () =>
  useQuery({ queryKey: chaves.idiomas, queryFn: () => api.get<Idioma[]>('/idiomas').then((r) => r.data) });

export function useSalvarIdioma() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, ...dados }: IdiomaInput & { id?: number }) =>
      (id ? api.put<Idioma>(`/idiomas/${id}`, dados) : api.post<Idioma>('/idiomas', dados)).then((r) => r.data),
    onSuccess: () => invalidar('idiomas', 'baralhos', 'baralho', 'estatisticas'),
  });
}

export function useExcluirIdioma() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/idiomas/${id}`),
    onSuccess: () => invalidar('idiomas', 'baralhos', 'baralho', 'sessoes', 'estatisticas'),
  });
}

// ---------- Baralhos ----------
export const useBaralhos = (idiomaId?: number) =>
  useQuery({
    queryKey: chaves.baralhos(idiomaId),
    queryFn: () => api.get<Baralho[]>('/baralhos', { params: idiomaId ? { idiomaId } : {} }).then((r) => r.data),
  });

export const useBaralho = (id: number) =>
  useQuery({
    queryKey: chaves.baralho(id),
    queryFn: () => api.get<Baralho>(`/baralhos/${id}`).then((r) => r.data),
    enabled: id > 0,
  });

export function useSalvarBaralho() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, ...dados }: BaralhoInput & { id?: number }) =>
      (id ? api.put<Baralho>(`/baralhos/${id}`, dados) : api.post<Baralho>('/baralhos', dados)).then((r) => r.data),
    onSuccess: () => invalidar('baralhos', 'baralho', 'idiomas', 'estatisticas'),
  });
}

export function useExcluirBaralho() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/baralhos/${id}`),
    onSuccess: () => invalidar('baralhos', 'idiomas', 'sessoes', 'estatisticas'),
  });
}

// ---------- Cartões ----------
export const useCartao = (id: number) =>
  useQuery({
    queryKey: chaves.cartao(id),
    queryFn: () => api.get<Cartao>(`/cartoes/${id}`).then((r) => r.data),
    enabled: id > 0,
  });

export function useSalvarCartao() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, ...dados }: CartaoInput & { id?: number }) =>
      (id ? api.put<Cartao>(`/cartoes/${id}`, dados) : api.post<Cartao>('/cartoes', dados)).then((r) => r.data),
    onSuccess: () => invalidar('baralho', 'baralhos', 'cartao', 'estatisticas'),
  });
}

export function useExcluirCartao() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/cartoes/${id}`),
    onSuccess: () => invalidar('baralho', 'baralhos', 'estatisticas'),
  });
}

/**
 * Registra a resposta de um cartão (repetição espaçada).
 * Não invalida nada no meio da sessão; a lista é atualizada quando a sessão é salva.
 */
export function useRevisarCartao() {
  return useMutation({
    mutationFn: ({ id, nota }: { id: number; nota: NotaRevisao }) =>
      api.post<Cartao>(`/cartoes/${id}/revisao`, { nota }).then((r) => r.data),
  });
}

// ---------- Sessões de estudo ----------
export const useSessoes = () =>
  useQuery({ queryKey: chaves.sessoes, queryFn: () => api.get<Sessao[]>('/sessoes').then((r) => r.data) });

export const useSessao = (id: number) =>
  useQuery({
    queryKey: chaves.sessao(id),
    queryFn: () => api.get<Sessao>(`/sessoes/${id}`).then((r) => r.data),
    enabled: id > 0,
  });

export function useSalvarSessao() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: ({ id, baralhoId, ...dados }: SessaoInput & { id?: number }) =>
      (id
        ? api.put<Sessao>(`/sessoes/${id}`, dados)
        : api.post<Sessao>('/sessoes', { baralhoId, ...dados })
      ).then((r) => r.data),
    onSuccess: () => invalidar('sessoes', 'sessao', 'estatisticas', 'baralho', 'baralhos'),
  });
}

export function useExcluirSessao() {
  const invalidar = useInvalidar();
  return useMutation({
    mutationFn: (id: number) => api.delete(`/sessoes/${id}`),
    onSuccess: () => invalidar('sessoes', 'estatisticas'),
  });
}

// ---------- Estatísticas ----------
export const useEstatisticas = () =>
  useQuery({
    queryKey: chaves.estatisticas,
    queryFn: () => api.get<Estatisticas>('/estatisticas').then((r) => r.data),
  });
