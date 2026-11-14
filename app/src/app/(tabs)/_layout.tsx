import { NativeTabs } from 'expo-router/native-tabs';
import { cores } from '@/theme';

export default function TabsLayout() {
  return (
    <NativeTabs tintColor={cores.primaria} backgroundColor={cores.superficie}>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>Início</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="house.fill" md="home" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="baralhos">
        <NativeTabs.Trigger.Label>Baralhos</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="rectangle.stack.fill" md="style" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="idiomas">
        <NativeTabs.Trigger.Label>Idiomas</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="globe" md="translate" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="historico">
        <NativeTabs.Trigger.Label>Histórico</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="chart.bar.fill" md="bar_chart" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="conta">
        <NativeTabs.Trigger.Label>Conta</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="person.crop.circle.fill" md="person" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
