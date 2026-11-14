import { create } from 'zustand';
import { Snackbar } from 'react-native-paper';

// Estado global da mensagem rápida (snackbar), disparável de qualquer tela.
type AvisoState = { mensagem: string | null; mostrar: (m: string) => void; fechar: () => void };

export const useAviso = create<AvisoState>((set) => ({
  mensagem: null,
  mostrar: (mensagem) => set({ mensagem }),
  fechar: () => set({ mensagem: null }),
}));

export function Aviso() {
  const { mensagem, fechar } = useAviso();
  return (
    <Snackbar visible={!!mensagem} onDismiss={fechar} duration={3000} style={{ marginBottom: 90 }}>
      {mensagem}
    </Snackbar>
  );
}
