import * as SecureStore from 'expo-secure-store';
import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { Usuario } from '@/api/tipos';

// Guarda a sessão no armazenamento seguro do aparelho (Keychain no iOS, Keystore no Android).
const armazenamentoSeguro: StateStorage = {
  getItem: (chave) => SecureStore.getItemAsync(chave),
  setItem: (chave, valor) => SecureStore.setItemAsync(chave, valor),
  removeItem: (chave) => SecureStore.deleteItemAsync(chave),
};

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
