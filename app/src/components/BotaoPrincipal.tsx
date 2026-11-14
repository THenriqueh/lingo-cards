import { ActivityIndicator, Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { feedback } from '@/lib/feedback';
import { brilho, cores, fontes } from '@/theme';

const PressableAnimado = Animated.createAnimatedComponent(Pressable);

type Props = {
  rotulo: string;
  aoPressionar: () => void;
  icone?: string;
  carregando?: boolean;
  desativado?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** CTA da marca: lima, texto à esquerda e um quadrado escuro com seta à direita. */
export function BotaoPrincipal({ rotulo, aoPressionar, icone = 'arrow-right', carregando, desativado, style }: Props) {
  const escala = useSharedValue(1);
  const estilo = useAnimatedStyle(() => ({ transform: [{ scale: escala.value }] }));
  const inativo = desativado || carregando;

  return (
    <PressableAnimado
      accessibilityRole="button"
      disabled={inativo}
      onPressIn={() => {
        escala.value = withTiming(0.97, { duration: 90 });
      }}
      onPressOut={() => {
        escala.value = withTiming(1, { duration: 140 });
      }}
      onPress={() => {
        feedback.toque();
        aoPressionar();
      }}
      style={[styles.botao, !inativo && brilho(cores.lima), inativo && styles.inativo, estilo, style]}
    >
      <Text style={styles.texto} numberOfLines={1}>
        {rotulo}
      </Text>
      <View style={styles.seta}>
        {carregando ? <ActivityIndicator color={cores.lima} /> : <Icon source={icone} size={20} color={cores.lima} />}
      </View>
    </PressableAnimado>
  );
}

const styles = StyleSheet.create({
  botao: {
    height: 56,
    borderRadius: 18,
    backgroundColor: cores.lima,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingLeft: 20,
    paddingRight: 9,
  },
  inativo: { opacity: 0.45 },
  texto: { fontFamily: fontes.titulo, fontSize: 16, color: cores.sobreCor, flex: 1 },
  seta: { width: 38, height: 38, borderRadius: 12, backgroundColor: cores.sobreCor, alignItems: 'center', justifyContent: 'center' },
});
