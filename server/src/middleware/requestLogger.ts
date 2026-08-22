import { randomUUID } from 'node:crypto';
import type { Request, Response } from 'express';
import { pinoHttp } from 'pino-http';
import { logger } from '../lib/logger.js';

// Logs every request (method, path, status, response time, etc.). The id is
// echoed back as a response header so a bug report from a user can be
// traced to one exact log line in Grafana.
export const requestLogger = pinoHttp<Request, Response>({
	logger,
	genReqId: (req, res) => {
		const existing = req.headers['x-request-id'];
		const id = typeof existing === 'string' ? existing : randomUUID();
		res.setHeader('X-Request-Id', id);
		return id;
	},
	customProps: (req) => ({
		ip: req.ip,
		origin: req.headers.origin ?? null,
	}),
});
