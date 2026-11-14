import { and, asc, eq, lte } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { baralhos, cartoes } from '../db/schema.js';
import { AppError, filtroNumerico, idDaRota, naoEncontrado, zId } from '../lib/http.js';
import { calcularRevisao, NOTAS } from '../lib/repeticao.js';

export const cartoesRoutes = Router();

const cartaoSchema = z.object({
  baralhoId: zId,
  frente: z.string().trim().min(1, 'Informe a frente do cartão.').max(200),
  verso: z.string().trim().min(1, 'Informe o verso do cartão.').max(200),
  exemplo: z.string().trim().max(500).nullish(),
});

async function garantirBaralhoDoUsuario(baralhoId: number, usuarioId: number) {
  const [baralho] = await db
    .select({ id: baralhos.id })
    .from(baralhos)
    .where(and(eq(baralhos.id, baralhoId), eq(baralhos.usuarioId, usuarioId)));
  if (!baralho) throw new AppError(400, 'Baralho informado não existe.');
}

async function tocarBaralho(baralhoId: number) {
  await db.update(baralhos).set({ atualizadoEm: new Date() }).where(eq(baralhos.id, baralhoId));
}

const revisaoSchema = z.object({
  nota: z.enum(NOTAS, 'Nota deve ser errei, dificil, acertei ou facil.'),
});

// GET /cartoes?baralhoId=1&pendentes=true  → só os cartões com revisão vencida
cartoesRoutes.get('/', async (req, res) => {
  const baralhoId = filtroNumerico(req, 'baralhoId');
  const pendentes = req.query.pendentes === 'true';
  const lista = await db
    .select()
    .from(cartoes)
    .where(
      and(
        eq(cartoes.usuarioId, req.usuarioId),
        baralhoId ? eq(cartoes.baralhoId, baralhoId) : undefined,
        pendentes ? lte(cartoes.proximaRevisao, new Date()) : undefined,
      ),
    )
    .orderBy(pendentes ? asc(cartoes.proximaRevisao) : asc(cartoes.id));
  res.json(lista);
});

cartoesRoutes.get('/:id', async (req, res) => {
  const cartao = await db.query.cartoes.findFirst({
    where: and(eq(cartoes.id, idDaRota(req)), eq(cartoes.usuarioId, req.usuarioId)),
    with: { baralho: true },
  });
  if (!cartao) throw naoEncontrado('Cartão');
  res.json(cartao);
});

cartoesRoutes.post('/', async (req, res) => {
  const dados = cartaoSchema.parse(req.body);
  await garantirBaralhoDoUsuario(dados.baralhoId, req.usuarioId);
  const [cartao] = await db.insert(cartoes).values({ ...dados, usuarioId: req.usuarioId }).returning();
  await tocarBaralho(cartao.baralhoId);
  res.status(201).json(cartao);
});

cartoesRoutes.put('/:id', async (req, res) => {
  const dados = cartaoSchema.partial().parse(req.body);
  if (dados.baralhoId) await garantirBaralhoDoUsuario(dados.baralhoId, req.usuarioId);
  const [cartao] = await db
    .update(cartoes)
    .set(dados)
    .where(and(eq(cartoes.id, idDaRota(req)), eq(cartoes.usuarioId, req.usuarioId)))
    .returning();
  if (!cartao) throw naoEncontrado('Cartão');
  await tocarBaralho(cartao.baralhoId);
  res.json(cartao);
});

// Registra a resposta do usuário e agenda a próxima revisão (SM-2).
cartoesRoutes.post('/:id/revisao', async (req, res) => {
  const { nota } = revisaoSchema.parse(req.body);
  const id = idDaRota(req);
  const [atual] = await db
    .select()
    .from(cartoes)
    .where(and(eq(cartoes.id, id), eq(cartoes.usuarioId, req.usuarioId)));
  if (!atual) throw naoEncontrado('Cartão');
  const [cartao] = await db.update(cartoes).set(calcularRevisao(atual, nota)).where(eq(cartoes.id, id)).returning();
  res.json(cartao);
});

cartoesRoutes.delete('/:id', async (req, res) => {
  const [cartao] = await db
    .delete(cartoes)
    .where(and(eq(cartoes.id, idDaRota(req)), eq(cartoes.usuarioId, req.usuarioId)))
    .returning({ id: cartoes.id, baralhoId: cartoes.baralhoId });
  if (!cartao) throw naoEncontrado('Cartão');
  await tocarBaralho(cartao.baralhoId);
  res.status(204).end();
});
