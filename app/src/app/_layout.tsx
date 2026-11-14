import { BricolageGrotesque_400Regular } from '@expo-google-fonts/bricolage-grotesque/400Regular';
import { BricolageGrotesque_600SemiBold } from '@expo-google-fonts/bricolage-grotesque/600SemiBold';
import { BricolageGrotesque_700Bold } from '@expo-google-fonts/bricolage-grotesque/700Bold';
import { BricolageGrotesque_800ExtraBold } from '@expo-google-fonts/bricolage-grotesque/800ExtraBold';
import { JetBrainsMono_500Medium } from '@expo-google-fonts/jetbrains-mono/500Medium';
import { JetBrainsMono_600SemiBold } from '@expo-google-fonts/jetbrains-mono/600SemiBold';
import { QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { DarkTheme, Stack, ThemeProvider } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { View } from 'react-native';
import { ActivityIndicator, PaperProvider } from 'react-native-paper';
import { queryClient } from '@/api/client';
import { Aviso } from '@/components/Aviso';
import { prepararSons } from '@/lib/feedback';
import { useAuth } from '@/store/auth';
import { cores, fontes, tema } from '@/theme';

const temaNavegacao = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: cores.fundo, card: cores.superficie, primary: cores.primaria },
};

export default function RootLayout() {
  const hidratado = useAuth((s) => s.hidratado);
  const logado = useAuth((s) => !!s.token);
  const [fontesProntas, erroFontes] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_700Bold,
    BricolageGrotesque_800ExtraBold,
    JetBrainsMono_500Medium,
    JetBrainsMono_600SemiBold,
  });

  useEffect(() => {
    prepararSons();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <PaperProvider theme={tema}>
        <ThemeProvider value={temaNavegacao}>
          <StatusBar style="light" />
          {!hidratado || (!fontesProntas && !erroFontes) ? (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: cores.fundo }}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <Stack
              screenOptions={{
                headerStyle: { backgroundColor: cores.fundo },
                headerTintColor: cores.texto,
                headerTitleStyle: { fontFamily: fontes.negrito },
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
                <Stack.Screen name="estudar/[id]" options={{ headerShown: false, gestureEnabled: false }} />
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
