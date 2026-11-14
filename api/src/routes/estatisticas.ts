import { count, eq, sql, sum } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db/index.js';
import { baralhos, cartoes, idiomas, sessoesEstudo } from '../db/schema.js';

export const estatisticasRoutes = Router();

estatisticasRoutes.get('/', async (req, res) => {
  const u = req.usuarioId;
  const [[i], [b], [c], [s]] = await Promise.all([
    db.select({ total: count() }).from(idiomas).where(eq(idiomas.usuarioId, u)),
    db.select({ total: count() }).from(baralhos).where(eq(baralhos.usuarioId, u)),
    db.select({ total: count() }).from(cartoes).where(eq(cartoes.usuarioId, u)),
    db
      .select({
        total: count(),
        acertos: sum(sessoesEstudo.acertos).mapWith(Number),
        erros: sum(sessoesEstudo.erros).mapWith(Number),
        segundos: sum(sessoesEstudo.duracaoSegundos).mapWith(Number),
        dias: sql<number>`count(distinct date(${sessoesEstudo.realizadaEm}))`.mapWith(Number),
      })
      .from(sessoesEstudo)
      .where(eq(sessoesEstudo.usuarioId, u)),
  ]);

  const respostas = (s.acertos ?? 0) + (s.erros ?? 0);
  res.json({
    totalIdiomas: i.total,
    totalBaralhos: b.total,
    totalCartoes: c.total,
    totalSessoes: s.total,
    diasEstudados: s.dias ?? 0,
    minutosEstudados: Math.round((s.segundos ?? 0) / 60),
    taxaAcerto: respostas > 0 ? Math.round(((s.acertos ?? 0) / respostas) * 100) : null,
  });
});
