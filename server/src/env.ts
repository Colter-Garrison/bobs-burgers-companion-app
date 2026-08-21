// Side-effect import: reads server/.env and copies its values into
// process.env. Must happen before we read process.env below.
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
	PORT: z.coerce.number().default(3000),
	CORS_ORIGINS: z.string().optional(),
});

export const env = envSchema.parse(process.env);
