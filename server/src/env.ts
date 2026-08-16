// Side-effect import: reads server/.env and copies its values into
// process.env. Must happen before we read process.env below.
import 'dotenv/config';
import { z } from 'zod';

// Validating env vars once at startup (instead of trusting they're set
// wherever they're used) means a missing/misspelled var fails immediately
// with a clear message, rather than surfacing later as a confusing crash
// mid-request.
const envSchema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
	PORT: z.coerce.number().default(3000),
	// Comma-separated list of origins allowed to call this API from a
	// browser. Optional (falls back to a hardcoded dev default in
	// app.ts) so CI's backend job and local dev don't need a new secret
	// just to run the test suite.
	CORS_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
