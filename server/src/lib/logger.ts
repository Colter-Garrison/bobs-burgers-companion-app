import pino from 'pino';
import type { LokiOptions } from 'pino-loki';
import { env } from '../env.js';

const hasLokiConfig = Boolean(
	env.GRAFANA_LOKI_HOST && env.GRAFANA_LOKI_USER_ID && env.GRAFANA_LOKI_API_KEY,
);
const isProduction = process.env.NODE_ENV === 'production';

// Local dev has Grafana credentials in `.env` too (so logs are visible in
// Grafana without needing a deploy), so these two conditions aren't
// mutually exclusive — pino's multi-target transport fans out to both at
// once instead of picking one. Outside production: Loki if configured,
// plus pino-pretty for a readable console (either or both, depending on
// whether Loki creds are present). In production: Loki alone if
// configured, otherwise pino's plain-JSON stdout default.
const targets: pino.TransportTargetOptions[] = [];
if (hasLokiConfig) {
	targets.push({
		target: 'pino-loki',
		options: {
			host: env.GRAFANA_LOKI_HOST as string,
			basicAuth: {
				username: env.GRAFANA_LOKI_USER_ID as string,
				password: env.GRAFANA_LOKI_API_KEY as string,
			},
			labels: { app: 'bobs-burgers-companion-server' },
		} satisfies LokiOptions,
	});
}
if (!isProduction) {
	targets.push({
		target: 'pino-pretty',
		options: {
			colorize: true,
			singleLine: true,
			// pino-http's default req/res dumps (full headers, etc.) are
			// useful in Grafana but too noisy for a console scanned live
			// during dev — surface just the morgan-style summary instead.
			ignore: 'pid,hostname,req,res,ip,origin,responseTime',
			messageFormat: '{req.method} {req.url} {res.statusCode} {responseTime}ms',
		},
	});
}

export const logger = targets.length > 0 ? pino(pino.transport({ targets })) : pino();
