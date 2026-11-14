import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { armazenamentoSeguro } from './armazenamento';

// Preferências do usuário neste aparelho: sons e vibração podem ser desligados na aba Conta.
export type ModoResposta = 'virar' | 'digitar';

type PreferenciasState = {
  sons: boolean;
  vibracao: boolean;
  /** Virar a carta e se autoavaliar, ou digitar a resposta e o app corrige. */
  modoResposta: ModoResposta;
  alternarSons: () => void;
  alternarVibracao: () => void;
  definirModoResposta: (modo: ModoResposta) => void;
};

export const usePreferencias = create<PreferenciasState>()(
  persist(
    (set) => ({
      sons: true,
      vibracao: true,
      modoResposta: 'virar',
      alternarSons: () => set((s) => ({ sons: !s.sons })),
      alternarVibracao: () => set((s) => ({ vibracao: !s.vibracao })),
      definirModoResposta: (modoResposta) => set({ modoResposta }),
    }),
    {
      name: 'lingo-cards-preferencias',
      storage: createJSONStorage(() => armazenamentoSeguro),
      partialize: ({ sons, vibracao, modoResposta }) => ({ sons, vibracao, modoResposta }),
    },
  ),
);
