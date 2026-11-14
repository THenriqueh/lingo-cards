import bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/index.js';
import { usuarios } from '../db/schema.js';
import { AppError } from '../lib/http.js';
import { autenticar, gerarToken } from '../middlewares/auth.js';

export const authRoutes = Router();

const publico = (u: typeof usuarios.$inferSelect) => ({ id: u.id, nome: u.nome, email: u.email, criadoEm: u.criadoEm });

const cadastroSchema = z.object({
  nome: z.string().trim().min(2, 'Informe seu nome.').max(80),
  email: z.email('E-mail inválido.').transform((e) => e.toLowerCase()),
  senha: z.string().min(6, 'A senha precisa ter pelo menos 6 caracteres.').max(72),
});

const loginSchema = z.object({
  email: z.email('E-mail inválido.').transform((e) => e.toLowerCase()),
  senha: z.string().min(1, 'Informe a senha.'),
});

authRoutes.post('/signup', async (req, res) => {
  const dados = cadastroSchema.parse(req.body);
  const [existente] = await db.select({ id: usuarios.id }).from(usuarios).where(eq(usuarios.email, dados.email));
  if (existente) throw new AppError(409, 'Já existe uma conta com este e-mail.');

  const senhaHash = await bcrypt.hash(dados.senha, 10);
  const [usuario] = await db.insert(usuarios).values({ nome: dados.nome, email: dados.email, senhaHash }).returning();
  res.status(201).json({ token: gerarToken(usuario.id, usuario.versaoToken), usuario: publico(usuario) });
});

authRoutes.post('/login', async (req, res) => {
  const dados = loginSchema.parse(req.body);
  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.email, dados.email));
  const senhaOk = usuario && (await bcrypt.compare(dados.senha, usuario.senhaHash));
  if (!senhaOk) throw new AppError(401, 'E-mail ou senha incorretos.');
  res.json({ token: gerarToken(usuario.id, usuario.versaoToken), usuario: publico(usuario) });
});

authRoutes.post('/logout', autenticar, async (req, res) => {
  await db
    .update(usuarios)
    .set({ versaoToken: sql`${usuarios.versaoToken} + 1` })
    .where(eq(usuarios.id, req.usuarioId));
  res.status(204).end();
});

authRoutes.get('/me', autenticar, async (req, res) => {
  const [usuario] = await db.select().from(usuarios).where(eq(usuarios.id, req.usuarioId));
  res.json(publico(usuario));
});
