import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { env } from '../env.js';
import * as schema from './schema.js';

// A connection pool, not a single connection — Express handles requests
// concurrently, so the pool hands out an available connection per query
// and reuses them, rather than opening/closing a new connection per
// request (which would be slow and would exhaust the database's
// connection limit under any real load).
const pool = new Pool({ connectionString: env.DATABASE_URL });

export const db = drizzle(pool, { schema });
