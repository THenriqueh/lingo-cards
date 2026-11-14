import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Usuario } from '@/api/tipos';
import { armazenamentoSeguro } from './armazenamento';

// A sessão fica no armazenamento seguro do aparelho.

type AuthState = {
  token: string | null;
  usuario: Usuario | null;
  hidratado: boolean;
  entrar: (token: string, usuario: Usuario) => void;
  sair: () => void;
};

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      usuario: null,
      hidratado: false,
      entrar: (token, usuario) => set({ token, usuario }),
      sair: () => set({ token: null, usuario: null }),
    }),
    {
      name: 'lingo-cards-sessao',
      storage: createJSONStorage(() => armazenamentoSeguro),
      partialize: ({ token, usuario }) => ({ token, usuario }),
      onRehydrateStorage: () => () => useAuth.setState({ hidratado: true }),
    },
  ),
);
