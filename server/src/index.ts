import express from 'express';
import { env } from './env.js';
import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import favoritesRoutes from './routes/favorites.js';
import { errorHandler } from './middleware/errorHandler.js';

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

app.listen(env.PORT, () => {
	console.log(`Server listening on port ${env.PORT}`);
});
