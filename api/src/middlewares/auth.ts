import { eq } from 'drizzle-orm';
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { db } from '../db/index.js';
import { usuarios } from '../db/schema.js';
import { env } from '../env.js';
import { AppError } from '../lib/http.js';

type Payload = { sub: string; v: number };

declare global {
  namespace Express {
    interface Request {
      usuarioId: number;
    }
  }
}

export function gerarToken(usuarioId: number, versaoToken: number) {
  return jwt.sign({ v: versaoToken }, env.JWT_SECRET, { subject: String(usuarioId), expiresIn: '7d' });
}

export async function autenticar(req: Request, _res: Response, next: NextFunction) {
  const [tipo, token] = (req.headers.authorization ?? '').split(' ');
  if (tipo !== 'Bearer' || !token) throw new AppError(401, 'Token não informado.');

  let payload: Payload;
  try {
    payload = jwt.verify(token, env.JWT_SECRET) as Payload;
  } catch {
    throw new AppError(401, 'Sessão inválida ou expirada. Faça login novamente.');
  }

  const usuarioId = Number(payload.sub);
  const [usuario] = await db
    .select({ versaoToken: usuarios.versaoToken })
    .from(usuarios)
    .where(eq(usuarios.id, usuarioId));

  // Usuário apagado ou token emitido antes do último logout.
  if (!usuario || usuario.versaoToken !== payload.v) {
    throw new AppError(401, 'Sessão encerrada. Faça login novamente.');
  }

  req.usuarioId = usuarioId;
  next();
}
