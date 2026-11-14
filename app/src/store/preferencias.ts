import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { armazenamentoSeguro } from './armazenamento';

// Preferências do usuário neste aparelho: sons e vibração podem ser desligados na aba Conta.
type PreferenciasState = {
  sons: boolean;
  vibracao: boolean;
  alternarSons: () => void;
  alternarVibracao: () => void;
};

export const usePreferencias = create<PreferenciasState>()(
  persist(
    (set) => ({
      sons: true,
      vibracao: true,
      alternarSons: () => set((s) => ({ sons: !s.sons })),
      alternarVibracao: () => set((s) => ({ vibracao: !s.vibracao })),
    }),
    {
      name: 'lingo-cards-preferencias',
      storage: createJSONStorage(() => armazenamentoSeguro),
      partialize: ({ sons, vibracao }) => ({ sons, vibracao }),
    },
  ),
);
