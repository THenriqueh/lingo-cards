import { Tabs } from 'expo-router/js-tabs';
import { BarraAbas } from '@/components/BarraAbas';
import { cores } from '@/theme';

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <BarraAbas {...props} />} screenOptions={{ headerShown: false, sceneStyle: { backgroundColor: cores.fundo } }}>
      <Tabs.Screen name="index" options={{ title: 'Início' }} />
      <Tabs.Screen name="baralhos" options={{ title: 'Baralhos' }} />
      <Tabs.Screen name="idiomas" options={{ title: 'Idiomas' }} />
      <Tabs.Screen name="historico" options={{ title: 'Histórico' }} />
      <Tabs.Screen name="conta" options={{ title: 'Conta' }} />
    </Tabs>
  );
}
