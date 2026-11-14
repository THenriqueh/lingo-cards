// API publicada (Render). É a usada no app publicado no Expo.
const URL_PRODUCAO = 'https://COLE-AQUI-A-URL-DO-RENDER.onrender.com';

// Em desenvolvimento, dá para apontar para a API rodando no seu computador
// criando o arquivo app/.env.local (ignorado pelo Git) com:
//   EXPO_PUBLIC_API_URL=http://<IP-do-seu-Mac-na-rede>:3333
// No app publicado (__DEV__ = false), sempre vale a URL de produção.
export const API_URL = (__DEV__ && process.env.EXPO_PUBLIC_API_URL) || URL_PRODUCAO;
