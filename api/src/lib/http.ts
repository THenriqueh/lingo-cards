import type { Request } from 'express';
import { z } from 'zod';

export class AppError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const naoEncontrado = (recurso: string) => new AppError(404, `${recurso} não encontrado(a).`);

/** Lê e valida o :id da rota. */
export function idDaRota(req: Request): number {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) throw new AppError(400, 'ID inválido.');
  return id;
}

/** Lê um filtro numérico opcional da query string (ex.: ?baralhoId=3). */
export function filtroNumerico(req: Request, nome: string): number | undefined {
  const valor = req.query[nome];
  if (valor === undefined) return undefined;
  const n = Number(valor);
  if (!Number.isInteger(n) || n <= 0) throw new AppError(400, `Filtro ${nome} inválido.`);
  return n;
}

export const zId = z.coerce.number().int().positive();
