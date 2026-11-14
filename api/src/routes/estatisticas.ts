import { and, count, eq, gte, lte, sql, sum } from 'drizzle-orm';
import { Router } from 'express';
import { db } from '../db/index.js';
import { baralhos, cartoes, idiomas, sessoesEstudo } from '../db/schema.js';

export const estatisticasRoutes = Router();

estatisticasRoutes.get('/', async (req, res) => {
  const u = req.usuarioId;
  const agora = new Date();
  const [[i], [b], [c], [s], [pendentes], [dominados]] = await Promise.all([
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
    db
      .select({ total: count() })
      .from(cartoes)
      .where(and(eq(cartoes.usuarioId, u), lte(cartoes.proximaRevisao, agora))),
    // "Dominado": o cartão já está com intervalo de 3 semanas ou mais.
    db
      .select({ total: count() })
      .from(cartoes)
      .where(and(eq(cartoes.usuarioId, u), gte(cartoes.intervaloDias, 21))),
  ]);

  const respostas = (s.acertos ?? 0) + (s.erros ?? 0);
  res.json({
    totalIdiomas: i.total,
    totalBaralhos: b.total,
    totalCartoes: c.total,
    totalSessoes: s.total,
    revisoesPendentes: pendentes.total,
    cartoesDominados: dominados.total,
    diasEstudados: s.dias ?? 0,
    minutosEstudados: Math.round((s.segundos ?? 0) / 60),
    taxaAcerto: respostas > 0 ? Math.round(((s.acertos ?? 0) / respostas) * 100) : null,
  });
});
