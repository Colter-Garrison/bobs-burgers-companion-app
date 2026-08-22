import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import favoritesRoutes from './routes/favorites.js';
import { errorHandler } from './middleware/errorHandler.js';
import { requestLogger } from './middleware/requestLogger.js';
import { env } from './env.js';

// Building the app here, separate from index.ts's app.listen() call,
// means tests can import `app` and exercise it directly over HTTP (via
// Supertest) without binding a real port — no server process to start,
// stop, or worry about colliding with another test run.
const app = express();

// Render terminates TLS and proxies requests to this app, so without
// this, req.ip would always be Render's internal proxy address instead
// of the real client — same thing requestLogger's ip field relies on.
app.set('trust proxy', 1);

const defaultOrigins = [
	'http://localhost:8081', // `expo start --web` dev server
	'http://localhost:4173', // `serve dist` — Playwright's static-export preview
];
const allowedOrigins = env.CORS_ORIGINS
	? env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
	: defaultOrigins;
app.use(cors({ origin: allowedOrigins }));

app.use(requestLogger);

app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/favorites', favoritesRoutes);

app.use((_req, res) => {
	res.status(404).json({ error: 'Not found' });
});

app.use(errorHandler);

export { app };
