import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

// Every route defined after this line requires a valid JWT — requireAuth
// runs first and populates req.userId, or responds with 401 and stops
// here.
router.use(requireAuth);

router.delete('/', async (req, res, next) => {
	try {
		// The favorites table's foreign key was defined with
		// onDelete: 'cascade', so Postgres removes this user's favorites
		// automatically as part of this same delete — no separate query
		// needed here.
		await db.delete(users).where(eq(users.id, req.userId!));
		return res.status(204).send();
	} catch (err) {
		next(err);
	}
});

export default router;
