import { relations } from 'drizzle-orm';
import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  nome: varchar('nome', { length: 80 }).notNull(),
  email: varchar('email', { length: 120 }).notNull().unique(),
  senhaHash: text('senha_hash').notNull(),
  // Incrementado no logout: invalida todos os tokens emitidos antes.
  versaoToken: integer('versao_token').notNull().default(0),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const idiomas = pgTable('idiomas', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  nome: varchar('nome', { length: 60 }).notNull(),
  codigo: varchar('codigo', { length: 10 }).notNull(),
  bandeira: varchar('bandeira', { length: 16 }).notNull().default('🌐'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const baralhos = pgTable('baralhos', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  idiomaId: integer('idioma_id').notNull().references(() => idiomas.id, { onDelete: 'cascade' }),
  titulo: varchar('titulo', { length: 80 }).notNull(),
  descricao: text('descricao').notNull().default(''),
  nivel: varchar('nivel', { length: 2 }).notNull().default('A1'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
  atualizadoEm: timestamp('atualizado_em').notNull().defaultNow(),
});

export const cartoes = pgTable('cartoes', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  baralhoId: integer('baralho_id').notNull().references(() => baralhos.id, { onDelete: 'cascade' }),
  frente: varchar('frente', { length: 200 }).notNull(),
  verso: varchar('verso', { length: 200 }).notNull(),
  exemplo: text('exemplo'),
  criadoEm: timestamp('criado_em').notNull().defaultNow(),
});

export const sessoesEstudo = pgTable('sessoes_estudo', {
  id: serial('id').primaryKey(),
  usuarioId: integer('usuario_id').notNull().references(() => usuarios.id, { onDelete: 'cascade' }),
  baralhoId: integer('baralho_id').notNull().references(() => baralhos.id, { onDelete: 'cascade' }),
  acertos: integer('acertos').notNull().default(0),
  erros: integer('erros').notNull().default(0),
  duracaoSegundos: integer('duracao_segundos').notNull().default(0),
  realizadaEm: timestamp('realizada_em').notNull().defaultNow(),
});

// Relacionamento 1: Idioma 1—N Baralho
export const idiomasRelations = relations(idiomas, ({ many }) => ({ baralhos: many(baralhos) }));

// Relacionamento 2: Baralho 1—N Cartão (e Baralho 1—N Sessão de estudo)
export const baralhosRelations = relations(baralhos, ({ one, many }) => ({
  idioma: one(idiomas, { fields: [baralhos.idiomaId], references: [idiomas.id] }),
  cartoes: many(cartoes),
  sessoes: many(sessoesEstudo),
}));

export const cartoesRelations = relations(cartoes, ({ one }) => ({
  baralho: one(baralhos, { fields: [cartoes.baralhoId], references: [baralhos.id] }),
}));

export const sessoesRelations = relations(sessoesEstudo, ({ one }) => ({
  baralho: one(baralhos, { fields: [sessoesEstudo.baralhoId], references: [baralhos.id] }),
}));
