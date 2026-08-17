import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import favoritesRoutes from './routes/favorites.js';
import { errorHandler } from './middleware/errorHandler.js';
import { env } from './env.js';

// Building the app here, separate from index.ts's app.listen() call,
// means tests can import `app` and exercise it directly over HTTP (via
// Supertest) without binding a real port — no server process to start,
// stop, or worry about colliding with another test run.
const app = express();

// The Expo app's web target runs in a real browser calling this API
// from a different origin (its dev server, or eventually Netlify) — the
// browser blocks that by default without these headers. Native
// (iOS/Android) requests carry no Origin header at all, so this
// allowlist never affects them.
const defaultOrigins = [
	'http://localhost:8081', // `expo start --web` dev server
	'http://localhost:4173', // `serve dist` — Playwright's static-export preview
];
const allowedOrigins = env.CORS_ORIGINS
	? env.CORS_ORIGINS.split(',').map((origin) => origin.trim())
	: defaultOrigins;
app.use(cors({ origin: allowedOrigins }));

app.use(express.json());

app.get('/health', (_req, res) => {
	res.json({ status: 'ok' });
});

app.use('/auth', authRoutes);
app.use('/profile', profileRoutes);
app.use('/favorites', favoritesRoutes);

// Catches any request that didn't match a route above, so unmatched
// routes get our consistent { error } JSON shape instead of Express's
// default plain-text "Cannot GET /whatever" response.
app.use((_req, res) => {
	res.status(404).json({ error: 'Not found' });
});

// Must be registered last — Express only treats a 4-argument middleware
// as an error handler, and only routes/middleware registered *before* it
// get their errors routed here.
app.use(errorHandler);

export { app };
