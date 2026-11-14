import { and, desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { baralhos, sessoesEstudo } from '../db/schema.js';
import { AppError, filtroNumerico, idDaRota, naoEncontrado, zId } from '../lib/http.js';

export const sessoesRoutes = Router();

const sessaoSchema = z.object({
  baralhoId: zId,
  acertos: z.number().int().min(0),
  erros: z.number().int().min(0),
  duracaoSegundos: z.number().int().min(0),
});

sessoesRoutes.get('/', async (req, res) => {
  const baralhoId = filtroNumerico(req, 'baralhoId');
  const lista = await db.query.sessoesEstudo.findMany({
    where: and(eq(sessoesEstudo.usuarioId, req.usuarioId), baralhoId ? eq(sessoesEstudo.baralhoId, baralhoId) : undefined),
    with: { baralho: { columns: { id: true, titulo: true } } },
    orderBy: desc(sessoesEstudo.realizadaEm),
    limit: 100,
  });
  res.json(lista);
});

sessoesRoutes.get('/:id', async (req, res) => {
  const sessao = await db.query.sessoesEstudo.findFirst({
    where: and(eq(sessoesEstudo.id, idDaRota(req)), eq(sessoesEstudo.usuarioId, req.usuarioId)),
    with: { baralho: true },
  });
  if (!sessao) throw naoEncontrado('Sessão de estudo');
  res.json(sessao);
});

sessoesRoutes.post('/', async (req, res) => {
  const dados = sessaoSchema.parse(req.body);
  const [baralho] = await db
    .select({ id: baralhos.id })
    .from(baralhos)
    .where(and(eq(baralhos.id, dados.baralhoId), eq(baralhos.usuarioId, req.usuarioId)));
  if (!baralho) throw new AppError(400, 'Baralho informado não existe.');
  const [sessao] = await db.insert(sessoesEstudo).values({ ...dados, usuarioId: req.usuarioId }).returning();
  res.status(201).json(sessao);
});

sessoesRoutes.put('/:id', async (req, res) => {
  const dados = sessaoSchema.omit({ baralhoId: true }).partial().parse(req.body);
  const [sessao] = await db
    .update(sessoesEstudo)
    .set(dados)
    .where(and(eq(sessoesEstudo.id, idDaRota(req)), eq(sessoesEstudo.usuarioId, req.usuarioId)))
    .returning();
  if (!sessao) throw naoEncontrado('Sessão de estudo');
  res.json(sessao);
});

sessoesRoutes.delete('/:id', async (req, res) => {
  const [sessao] = await db
    .delete(sessoesEstudo)
    .where(and(eq(sessoesEstudo.id, idDaRota(req)), eq(sessoesEstudo.usuarioId, req.usuarioId)))
    .returning({ id: sessoesEstudo.id });
  if (!sessao) throw naoEncontrado('Sessão de estudo');
  res.status(204).end();
});
