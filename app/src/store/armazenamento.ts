import * as SecureStore from 'expo-secure-store';
import type { StateStorage } from 'zustand/middleware';

// Armazenamento seguro do aparelho (Keychain no iOS, Keystore no Android) para o persist do Zustand.
export const armazenamentoSeguro: StateStorage = {
  getItem: (chave) => SecureStore.getItemAsync(chave),
  setItem: (chave, valor) => SecureStore.setItemAsync(chave, valor),
  removeItem: (chave) => SecureStore.deleteItemAsync(chave),
};
