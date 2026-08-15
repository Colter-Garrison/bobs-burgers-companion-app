import express from 'express';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import favoritesRoutes from './routes/favorites.js';
import { errorHandler } from './middleware/errorHandler.js';

// Building the app here, separate from index.ts's app.listen() call,
// means tests can import `app` and exercise it directly over HTTP (via
// Supertest) without binding a real port — no server process to start,
// stop, or worry about colliding with another test run.
const app = express();
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
