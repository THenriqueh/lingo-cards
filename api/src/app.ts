import cors from 'cors';
import express from 'express';
import { autenticar } from './middlewares/auth.js';
import { tratarErros } from './middlewares/erros.js';
import { authRoutes } from './routes/auth.js';
import { baralhosRoutes } from './routes/baralhos.js';
import { cartoesRoutes } from './routes/cartoes.js';
import { estatisticasRoutes } from './routes/estatisticas.js';
import { idiomasRoutes } from './routes/idiomas.js';
import { sessoesRoutes } from './routes/sessoes.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => res.json({ api: 'Lingo Cards', status: 'ok' }));

app.use('/auth', authRoutes);
app.use('/idiomas', autenticar, idiomasRoutes);
app.use('/baralhos', autenticar, baralhosRoutes);
app.use('/cartoes', autenticar, cartoesRoutes);
app.use('/sessoes', autenticar, sessoesRoutes);
app.use('/estatisticas', autenticar, estatisticasRoutes);

app.use((_req, res) => res.status(404).json({ erro: 'Rota não encontrada.' }));
app.use(tratarErros);
