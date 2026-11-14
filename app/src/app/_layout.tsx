import { QueryClientProvider } from '@tanstack/react-query';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { queryClient } from '@/api/client';
import { Aviso } from '@/components/Aviso';
import { useAuth } from '@/store/auth';
import { cores, tema } from '@/theme';

const temaNavegacao = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: cores.fundo, card: cores.superficie, primary: cores.primaria },
};

export default function RootLayout() {
  const hidratado = useAuth((s) => s.hidratado);
  const logado = useAuth((s) => !!s.token);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={tema}>
        <ThemeProvider value={temaNavegacao}>
          <StatusBar style="light" />
          {!hidratado ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: cores.fundo },
                headerTintColor: cores.texto,
                headerShadowVisible: false,
                headerBackButtonDisplayMode: 'minimal',
                contentStyle: { backgroundColor: cores.fundo },
              }}
            >
              {/* Sem sessão: só as telas de acesso. */}
              <Stack.Protected guard={!logado}>
                <Stack.Screen name="(auth)/login" options={{ headerShown: false }} />
                <Stack.Screen name="(auth)/cadastro" options={{ title: 'Criar conta' }} />
              </Stack.Protected>

              {/* Com sessão: o app. */}
              <Stack.Protected guard={logado}>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="baralho/[id]" options={{ title: '' }} />
                <Stack.Screen name="baralho/editar" options={{ title: 'Baralho', presentation: 'modal' }} />
                <Stack.Screen name="idioma/editar" options={{ title: 'Idioma', presentation: 'modal' }} />
                <Stack.Screen name="cartao/editar" options={{ title: 'Cartão', presentation: 'modal' }} />
                <Stack.Screen name="sessao/[id]" options={{ title: 'Sessão de estudo', presentation: 'modal' }} />
                <Stack.Screen name="estudar/[id]" options={{ title: 'Estudar', gestureEnabled: false }} />
                <Stack.Screen name="sobre" options={{ title: 'Sobre o app' }} />
                <Stack.Screen name="integrante" options={{ title: 'Desenvolvedor' }} />
              </Stack.Protected>
            </Stack>
          )}
          <Aviso />
        </ThemeProvider>
      </PaperProvider>
    </QueryClientProvider>
  );
}
