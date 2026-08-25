// Side-effect import: reads server/.env and copies its values into
// process.env. Must happen before we read process.env below.
import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
	DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
	JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
	PORT: z.coerce.number().default(3000),
	CORS_ORIGINS: z.string().optional(),
	GRAFANA_LOKI_HOST: z.string().optional(),
	GRAFANA_LOKI_USER_ID: z.string().optional(),
	GRAFANA_LOKI_API_KEY: z.string().optional(),
	RESEND_API_KEY: z.string().optional(),
	EMAIL_FROM_ADDRESS: z.string().default('onboarding@resend.dev'),
	WEB_APP_URL: z.string().default('http://localhost:8081'),
});

export const env = envSchema.parse(process.env);

// The test suite must never depend on (or accidentally trigger) a real
// Resend send, regardless of what's configured in the shared .env for
// manual testing — force lib/email.ts's console-log fallback during
// tests. Vitest sets NODE_ENV to 'test' itself; nothing else needs to.
if (process.env.NODE_ENV === 'test') {
	env.RESEND_API_KEY = undefined;
}
