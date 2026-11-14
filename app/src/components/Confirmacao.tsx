import { useEffect } from 'react';
import { Button, Dialog, Portal, Text } from 'react-native-paper';
import { feedback } from '@/lib/feedback';
import { cores } from '@/theme';

type Props = {
  visivel: boolean;
  titulo: string;
  mensagem: string;
  carregando?: boolean;
  aoConfirmar: () => void;
  aoCancelar: () => void;
};

export function Confirmacao({ visivel, titulo, mensagem, carregando, aoConfirmar, aoCancelar }: Props) {
  useEffect(() => {
    if (visivel) feedback.alerta();
  }, [visivel]);

  return (
    <Portal>
      <Dialog visible={visivel} onDismiss={aoCancelar}>
        <Dialog.Icon icon="alert" color={cores.erro} />
        <Dialog.Title style={{ textAlign: 'center' }}>{titulo}</Dialog.Title>
        <Dialog.Content>
          <Text>{mensagem}</Text>
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={aoCancelar}>Cancelar</Button>
          <Button textColor={cores.erro} loading={carregando} disabled={carregando} onPress={() => {
              feedback.excluir();
              aoConfirmar();
            }}
          >
            Excluir
          </Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
}
