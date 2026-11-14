import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { usePreferencias } from '@/store/preferencias';

// Efeitos sonoros curtos, sintetizados para o app (sem áudio de terceiros).
const arquivos = {
  toque: require('../../assets/sons/toque.wav'),
  virar: require('../../assets/sons/virar.wav'),
  acerto: require('../../assets/sons/acerto.wav'),
  erro: require('../../assets/sons/erro.wav'),
  conclusao: require('../../assets/sons/conclusao.wav'),
  sucesso: require('../../assets/sons/sucesso.wav'),
  excluir: require('../../assets/sons/excluir.wav'),
};
type Som = keyof typeof arquivos;

const players: Partial<Record<Som, AudioPlayer>> = {};

/** Carrega os sons uma vez, no início do app, para tocarem sem atraso. */
export function prepararSons() {
  // Respeita a chave de silencioso do iPhone e não interrompe a música de outros apps.
  setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
  for (const som of Object.keys(arquivos) as Som[]) {
    try {
      players[som] ??= createAudioPlayer(arquivos[som]);
    } catch {
      // Sem som não é motivo para quebrar o app.
    }
  }
}

function tocar(som: Som) {
  if (!usePreferencias.getState().sons) return;
  const player = players[som];
  if (!player) return;
  try {
    if (player.currentTime > 0) {
      player.seekTo(0).then(() => player.play()).catch(() => {});
    } else {
      player.play();
    }
  } catch {
    // ignora
  }
}

function vibrar(acao: () => Promise<void>) {
  if (!usePreferencias.getState().vibracao) return;
  acao().catch(() => {});
}

const { ImpactFeedbackStyle: Impacto, NotificationFeedbackType: Notificacao } = Haptics;

/** Retorno de som e vibração para cada tipo de interação. */
export const feedback = {
  toque: () => vibrar(() => Haptics.selectionAsync()),
  selecao: () => {
    tocar('toque');
    vibrar(() => Haptics.selectionAsync());
  },
  virar: () => {
    tocar('virar');
    vibrar(() => Haptics.impactAsync(Impacto.Light));
  },
  acerto: () => {
    tocar('acerto');
    vibrar(() => Haptics.notificationAsync(Notificacao.Success));
  },
  erro: () => {
    tocar('erro');
    vibrar(() => Haptics.notificationAsync(Notificacao.Error));
  },
  conclusao: () => {
    tocar('conclusao');
    vibrar(() => Haptics.notificationAsync(Notificacao.Success));
  },
  sucesso: () => {
    tocar('sucesso');
    vibrar(() => Haptics.impactAsync(Impacto.Light));
  },
  alerta: () => vibrar(() => Haptics.notificationAsync(Notificacao.Warning)),
  excluir: () => {
    tocar('excluir');
    vibrar(() => Haptics.impactAsync(Impacto.Medium));
  },
};
