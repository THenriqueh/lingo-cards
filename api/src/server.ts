import { app } from './app.js';
import { env } from './env.js';

app.listen(env.PORT, () => {
  console.log(`Lingo Cards API rodando na porta ${env.PORT}`);
});
