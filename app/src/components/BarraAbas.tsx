import { LinearGradient } from 'expo-linear-gradient';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { Pressable, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { feedback } from '@/lib/feedback';
import { cores, fontes } from '@/theme';

const ICONES: Record<string, string> = {
  index: 'home-outline',
  baralhos: 'layers-outline',
  idiomas: 'web',
  historico: 'chart-bar',
  conta: 'account-outline',
};

/** Tab bar flutuante: pílula lima atrás do ícone ativo. */
export function BarraAbas({ state, descriptors, emitter, navigateToTab }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const baixo = Math.max(12, insets.bottom - 8);

  return (
    <View style={[styles.raiz, { pointerEvents: 'box-none' }]}>
      {/* Degradê atrás da barra, para o conteúdo "sumir" por baixo dela. */}
      <LinearGradient colors={['rgba(11,12,20,0)', cores.fundo]} style={[styles.degrade, { height: 110 + baixo, pointerEvents: 'none' }]} />
      <View style={[styles.barra, { marginBottom: baixo }]}>
        {state.routes.map((rota, i) => {
          const ativo = state.index === i;
          const titulo = descriptors[rota.key].options.title ?? rota.name;
          return (
            <Pressable
              key={rota.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: ativo }}
              accessibilityLabel={titulo}
              style={styles.item}
              onPress={() => {
                const evento = emitter.emit({ type: 'tabPress', target: rota.key, canPreventDefault: true });
                if (!ativo && !evento.defaultPrevented) {
                  feedback.selecao();
                  navigateToTab(rota.key);
                }
              }}
            >
              <View style={[styles.pilula, ativo && styles.pilulaAtiva]}>
                <Icon source={ICONES[rota.name] ?? 'circle-outline'} size={19} color={ativo ? cores.sobreCor : cores.textoSuave} />
              </View>
              <Text style={[styles.rotulo, { color: ativo ? cores.lima : cores.textoSuave }]} numberOfLines={1}>
                {titulo}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  raiz: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  degrade: { position: 'absolute', left: 0, right: 0, bottom: 0 },
  barra: {
    marginHorizontal: 10,
    height: 62,
    borderRadius: 22,
    backgroundColor: '#161827',
    borderWidth: 1,
    borderColor: cores.borda,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  item: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 3 },
  pilula: { width: 44, height: 28, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  pilulaAtiva: { backgroundColor: cores.lima },
  rotulo: { fontFamily: fontes.semi, fontSize: 10 },
});
