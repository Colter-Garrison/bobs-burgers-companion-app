import pino from 'pino';
import type { LokiOptions } from 'pino-loki';
import { env } from '../env.js';

const hasLokiConfig = Boolean(
	env.GRAFANA_LOKI_HOST && env.GRAFANA_LOKI_USER_ID && env.GRAFANA_LOKI_API_KEY,
);

// Without Grafana credentials (local dev, or CI) logs just fall back to
// pino's default plain-JSON stdout output — no separate pretty-printer
// dependency needed just to run `npm run dev`.
export const logger = hasLokiConfig
	? pino(
			pino.transport<LokiOptions>({
				target: 'pino-loki',
				options: {
					host: env.GRAFANA_LOKI_HOST as string,
					basicAuth: {
						username: env.GRAFANA_LOKI_USER_ID as string,
						password: env.GRAFANA_LOKI_API_KEY as string,
					},
					labels: { app: 'bobs-burgers-companion-server' },
				},
			}),
		)
	: pino();
