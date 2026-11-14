import { QueryClient } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { API_URL } from '@/config';
import { useAuth } from '@/store/auth';

export const api = axios.create({ baseURL: API_URL, timeout: 60000 });

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, staleTime: 30_000 },
  },
});

// Envia o token JWT em toda requisição.
api.interceptors.request.use((config) => {
  const { token } = useAuth.getState();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Sessão expirada ou encerrada: limpa os dados e volta para o login.
api.interceptors.response.use(
  (resposta) => resposta,
  (erro: AxiosError) => {
    const rotaDeAuth = erro.config?.url?.startsWith('/auth/login') || erro.config?.url?.startsWith('/auth/signup');
    if (erro.response?.status === 401 && !rotaDeAuth && useAuth.getState().token) {
      useAuth.getState().sair();
      queryClient.clear();
    }
    return Promise.reject(erro);
  },
);

/** Transforma qualquer erro da API numa mensagem legível. */
export function mensagemDeErro(erro: unknown): string {
  if (erro instanceof AxiosError) {
    if (!erro.response) return 'Não foi possível falar com o servidor. Verifique sua conexão.';
    const dados = erro.response.data as { erro?: string; detalhes?: { mensagem: string }[] } | undefined;
    return dados?.detalhes?.[0]?.mensagem ?? dados?.erro ?? `Erro ${erro.response.status}.`;
  }
  return 'Algo deu errado. Tente novamente.';
}
