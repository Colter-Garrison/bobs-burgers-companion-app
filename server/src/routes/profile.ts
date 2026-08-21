import { Router } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.delete('/', async (req, res, next) => {
	try {
		await db.delete(users).where(eq(users.id, req.userId!));
		return res.status(204).send();
	} catch (err) {
		next(err);
	}
});

export default router;
