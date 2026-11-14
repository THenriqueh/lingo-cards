import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { env } from '../env.js';
import * as schema from './schema.js';

// O SSL é definido pela própria URL: bancos na nuvem (ex.: Neon) usam ?sslmode=require;
// o Postgres local do Docker Compose não usa SSL.
export const pool = new pg.Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
