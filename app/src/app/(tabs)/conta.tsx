import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { Icon, Text } from 'react-native-paper';
import { queryClient } from '@/api/client';
import { autenticacao } from '@/api/hooks';
import { Tela } from '@/components/Tela';
import { CabecalhoTela, Cartao, Linha, ListaGrupo, RotuloSecao, Toggle } from '@/components/ui';
import { mesAno } from '@/lib/formato';
import { useAuth } from '@/store/auth';
import { usePreferencias } from '@/store/preferencias';
import { cores, fontes } from '@/theme';

export default function Conta() {
  const router = useRouter();
  const { usuario, sair } = useAuth();
  const [saindo, setSaindo] = useState(false);
  const { sons, vibracao, alternarSons, alternarVibracao } = usePreferencias();

  async function handleSair() {
    setSaindo(true);
    try {
      await autenticacao.logout(); // invalida o token no servidor
    } catch {
      // Mesmo sem conexão, a sessão local é encerrada.
    }
    queryClient.clear();
    sair();
  }

  const inicial = (usuario?.nome ?? '?').charAt(0).toUpperCase();

  return (
    <Tela semCabecalho>
      <CabecalhoTela titulo="Conta" />

      <Cartao>
        <View style={styles.perfil}>
          <View style={styles.avatar}>
            <Text style={styles.avatarLetra}>{inicial}</Text>
          </View>
          <View style={{ flex: 1, gap: 2 }}>
            <Text style={styles.nome} numberOfLines={1}>
              {usuario?.nome}
            </Text>
            <Text style={styles.email} numberOfLines={1}>
              {usuario?.email}
            </Text>
          </View>
        </View>
        <View style={styles.rodape}>
          <RotuloSecao>{usuario?.criadoEm ? `Membro desde ${mesAno(usuario.criadoEm)}` : 'Membro'}</RotuloSecao>
          <RotuloSecao cor={cores.lima}>Plano grátis</RotuloSecao>
        </View>
      </Cartao>

      <RotuloSecao style={{ marginTop: 6 }}>Preferências</RotuloSecao>
      <ListaGrupo>
        <Linha>
          <Icon source={sons ? 'volume-high' : 'volume-off'} size={20} color={cores.texto2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.item}>Sons</Text>
            <Text style={styles.itemInfo}>Respeita o modo silencioso</Text>
          </View>
          <Toggle ligado={sons} aoAlternar={alternarSons} />
        </Linha>
        <Linha>
          <Icon source={vibracao ? 'vibrate' : 'vibrate-off'} size={20} color={cores.texto2} />
          <View style={{ flex: 1 }}>
            <Text style={styles.item}>Vibração</Text>
            <Text style={styles.itemInfo}>Retorno tátil nos toques</Text>
          </View>
          <Toggle ligado={vibracao} aoAlternar={alternarVibracao} />
        </Linha>
      </ListaGrupo>

      <RotuloSecao style={{ marginTop: 6 }}>Sobre</RotuloSecao>
      <ListaGrupo>
        <Linha aoPressionar={() => router.push('/sobre')}>
          <Text style={[styles.item, { flex: 1 }]}>
            Sobre o app <Text style={styles.versao}>v1.0</Text>
          </Text>
          <Icon source="chevron-right" size={22} color={cores.textoSuave} />
        </Linha>
        <Linha aoPressionar={() => router.push('/integrante')}>
          <Text style={[styles.item, { flex: 1 }]}>Quem fez o Lingo Cards</Text>
          <Icon source="chevron-right" size={22} color={cores.textoSuave} />
        </Linha>
        <Linha aoPressionar={saindo ? undefined : handleSair}>
          {saindo ? <ActivityIndicator color={cores.coral} /> : <Icon source="logout" size={20} color={cores.coral} />}
          <Text style={[styles.item, { color: cores.coral, flex: 1 }]}>Sair da conta</Text>
        </Linha>
      </ListaGrupo>
    </Tela>
  );
}

const styles = StyleSheet.create({
  perfil: { flexDirection: 'row', alignItems: 'center', gap: 14, padding: 16 },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: cores.lima,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ rotate: '-4deg' }],
  },
  avatarLetra: { fontFamily: fontes.titulo, fontSize: 24, color: cores.sobreCor },
  nome: { fontFamily: fontes.titulo, fontSize: 18, color: cores.texto },
  email: { fontFamily: fontes.corpo, fontSize: 12, color: cores.textoSuave },
  rodape: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: cores.borda,
    marginHorizontal: 16,
    paddingVertical: 12,
  },
  item: { fontFamily: fontes.negrito, fontSize: 16, color: cores.texto },
  itemInfo: { fontFamily: fontes.corpo, fontSize: 12, color: cores.textoSuave, marginTop: 1 },
  versao: { fontFamily: fontes.mono, fontSize: 11, color: cores.textoSuave },
});
