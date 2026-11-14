import { and, asc, count, eq } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { baralhos, idiomas } from '../db/schema.js';
import { idDaRota, naoEncontrado } from '../lib/http.js';

export const idiomasRoutes = Router();

const idiomaSchema = z.object({
  nome: z.string().trim().min(2, 'Informe o nome do idioma.').max(60),
  codigo: z.string().trim().min(2, 'Informe o código (ex.: de, en).').max(10).transform((c) => c.toLowerCase()),
  bandeira: z.string().trim().min(1).max(16).optional(),
});

idiomasRoutes.get('/', async (req, res) => {
  const lista = await db
    .select({
      id: idiomas.id,
      nome: idiomas.nome,
      codigo: idiomas.codigo,
      bandeira: idiomas.bandeira,
      criadoEm: idiomas.criadoEm,
      totalBaralhos: count(baralhos.id),
    })
    .from(idiomas)
    .leftJoin(baralhos, eq(baralhos.idiomaId, idiomas.id))
    .where(eq(idiomas.usuarioId, req.usuarioId))
    .groupBy(idiomas.id)
    .orderBy(asc(idiomas.nome));
  res.json(lista);
});

idiomasRoutes.get('/:id', async (req, res) => {
  const idioma = await db.query.idiomas.findFirst({
    where: and(eq(idiomas.id, idDaRota(req)), eq(idiomas.usuarioId, req.usuarioId)),
    with: { baralhos: true },
  });
  if (!idioma) throw naoEncontrado('Idioma');
  res.json(idioma);
});

idiomasRoutes.post('/', async (req, res) => {
  const dados = idiomaSchema.parse(req.body);
  const [idioma] = await db.insert(idiomas).values({ ...dados, usuarioId: req.usuarioId }).returning();
  res.status(201).json(idioma);
});

idiomasRoutes.put('/:id', async (req, res) => {
  const dados = idiomaSchema.partial().parse(req.body);
  const [idioma] = await db
    .update(idiomas)
    .set(dados)
    .where(and(eq(idiomas.id, idDaRota(req)), eq(idiomas.usuarioId, req.usuarioId)))
    .returning();
  if (!idioma) throw naoEncontrado('Idioma');
  res.json(idioma);
});

idiomasRoutes.delete('/:id', async (req, res) => {
  const [idioma] = await db
    .delete(idiomas)
    .where(and(eq(idiomas.id, idDaRota(req)), eq(idiomas.usuarioId, req.usuarioId)))
    .returning({ id: idiomas.id });
  if (!idioma) throw naoEncontrado('Idioma');
  res.status(204).end();
});
