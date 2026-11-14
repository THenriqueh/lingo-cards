import type { AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { usePreferencias } from '@/store/preferencias';

// Efeitos sonoros curtos, sintetizados para o app (sem áudio de terceiros).
// Só os momentos do estudo têm som; o resto da navegação usa apenas vibração.
const arquivos = {
  virar: require('../../assets/sons/virar.wav'),
  acerto: require('../../assets/sons/acerto.wav'),
  erro: require('../../assets/sons/erro.wav'),
  conclusao: require('../../assets/sons/conclusao.wav'),
};
type Som = keyof typeof arquivos;

const players: Partial<Record<Som, AudioPlayer>> = {};

/**
 * Carrega os sons uma vez, depois que o app abriu, para tocarem sem atraso.
 * O módulo de áudio é carregado sob demanda: se ele não estiver disponível no aparelho,
 * o app continua funcionando, só que sem som.
 */
export function prepararSons() {
  try {
    const { createAudioPlayer, setAudioModeAsync } = require('expo-audio') as typeof import('expo-audio');
    // Respeita a chave de silencioso do iPhone e não interrompe a música de outros apps.
    setAudioModeAsync({ playsInSilentMode: false, interruptionMode: 'mixWithOthers' }).catch(() => {});
    for (const som of Object.keys(arquivos) as Som[]) {
      players[som] ??= createAudioPlayer(arquivos[som]);
    }
  } catch (erro) {
    console.warn('Sons desativados: módulo de áudio indisponível.', erro);
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
  selecao: () => vibrar(() => Haptics.selectionAsync()),
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
    vibrar(() => Haptics.notificationAsync(Notificacao.Warning));
  },
  conclusao: () => {
    tocar('conclusao');
    vibrar(() => Haptics.notificationAsync(Notificacao.Success));
  },
  sucesso: () => vibrar(() => Haptics.impactAsync(Impacto.Light)),
  alerta: () => vibrar(() => Haptics.notificationAsync(Notificacao.Warning)),
  excluir: () => vibrar(() => Haptics.impactAsync(Impacto.Medium)),
};
