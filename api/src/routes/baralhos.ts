import { and, desc, eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { baralhos, idiomas } from '../db/schema.js';
import { AppError, filtroNumerico, idDaRota, naoEncontrado, zId } from '../lib/http.js';

export const baralhosRoutes = Router();

const NIVEIS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'] as const;

const baralhoSchema = z.object({
  idiomaId: zId,
  titulo: z.string().trim().min(2, 'Informe o título do baralho.').max(80),
  descricao: z.string().trim().max(500).optional(),
  nivel: z.enum(NIVEIS, 'Nível deve ser A1, A2, B1, B2, C1 ou C2.').optional(),
});

async function garantirIdiomaDoUsuario(idiomaId: number, usuarioId: number) {
  const [idioma] = await db
    .select({ id: idiomas.id })
    .from(idiomas)
    .where(and(eq(idiomas.id, idiomaId), eq(idiomas.usuarioId, usuarioId)));
  if (!idioma) throw new AppError(400, 'Idioma informado não existe.');
}

const comContagens = {
  idioma: true,
  cartoes: { columns: { id: true } },
} as const;

function resumir<T extends { cartoes: { id: number }[] }>(b: T) {
  const { cartoes, ...resto } = b;
  return { ...resto, totalCartoes: cartoes.length };
}

baralhosRoutes.get('/', async (req, res) => {
  const idiomaId = filtroNumerico(req, 'idiomaId');
  const lista = await db.query.baralhos.findMany({
    where: and(eq(baralhos.usuarioId, req.usuarioId), idiomaId ? eq(baralhos.idiomaId, idiomaId) : undefined),
    with: comContagens,
    orderBy: desc(baralhos.atualizadoEm),
  });
  res.json(lista.map(resumir));
});

baralhosRoutes.get('/:id', async (req, res) => {
  const baralho = await db.query.baralhos.findFirst({
    where: and(eq(baralhos.id, idDaRota(req)), eq(baralhos.usuarioId, req.usuarioId)),
    with: { idioma: true, cartoes: true },
  });
  if (!baralho) throw naoEncontrado('Baralho');
  res.json({ ...baralho, totalCartoes: baralho.cartoes.length });
});

baralhosRoutes.post('/', async (req, res) => {
  const dados = baralhoSchema.parse(req.body);
  await garantirIdiomaDoUsuario(dados.idiomaId, req.usuarioId);
  const [baralho] = await db.insert(baralhos).values({ ...dados, usuarioId: req.usuarioId }).returning();
  res.status(201).json(baralho);
});

baralhosRoutes.put('/:id', async (req, res) => {
  const dados = baralhoSchema.partial().parse(req.body);
  if (dados.idiomaId) await garantirIdiomaDoUsuario(dados.idiomaId, req.usuarioId);
  const [baralho] = await db
    .update(baralhos)
    .set({ ...dados, atualizadoEm: new Date() })
    .where(and(eq(baralhos.id, idDaRota(req)), eq(baralhos.usuarioId, req.usuarioId)))
    .returning();
  if (!baralho) throw naoEncontrado('Baralho');
  res.json(baralho);
});

baralhosRoutes.delete('/:id', async (req, res) => {
  const [baralho] = await db
    .delete(baralhos)
    .where(and(eq(baralhos.id, idDaRota(req)), eq(baralhos.usuarioId, req.usuarioId)))
    .returning({ id: baralhos.id });
  if (!baralho) throw naoEncontrado('Baralho');
  res.status(204).end();
});
