import { Router } from 'express';
import { z } from 'zod';
import { and, eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { favorites, categoryEnum } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const categoryParamSchema = z.enum(categoryEnum.enumValues);
const addFavoriteBodySchema = z.object({
	itemId: z.number().int().positive(),
});
const itemIdParamSchema = z.coerce.number().int().positive();

router.get('/', async (req, res, next) => {
	try {
		const rows = await db
			.select()
			.from(favorites)
			.where(eq(favorites.userId, req.userId!));
		return res.json(rows);
	} catch (err) {
		next(err);
	}
});

router.post('/:category', async (req, res, next) => {
	const categoryResult = categoryParamSchema.safeParse(req.params.category);
	if (!categoryResult.success) {
		return res.status(400).json({ error: 'Invalid category' });
	}
	const bodyResult = addFavoriteBodySchema.safeParse(req.body);
	if (!bodyResult.success) {
		return res
			.status(400)
			.json({ error: 'itemId is required and must be a positive integer' });
	}

	try {
		const [favorite] = await db
			.insert(favorites)
			.values({
				userId: req.userId!,
				category: categoryResult.data,
				itemId: bodyResult.data.itemId,
			})
			.returning();
		return res.status(201).json(favorite);
	} catch (err: any) {
		if (err.code === '23505') {
			return res.status(409).json({ error: 'Already favorited' });
		}
		next(err);
	}
});

router.delete('/:category/:itemId', async (req, res, next) => {
	const categoryResult = categoryParamSchema.safeParse(req.params.category);
	if (!categoryResult.success) {
		return res.status(400).json({ error: 'Invalid category' });
	}
	const itemIdResult = itemIdParamSchema.safeParse(req.params.itemId);
	if (!itemIdResult.success) {
		return res.status(400).json({ error: 'itemId must be a positive integer' });
	}

	try {
		const [deleted] = await db
			.delete(favorites)
			.where(
				and(
					eq(favorites.userId, req.userId!),
					eq(favorites.category, categoryResult.data),
					eq(favorites.itemId, itemIdResult.data),
				),
			)
			.returning();

		if (!deleted) {
			return res.status(404).json({ error: 'Favorite not found' });
		}
		return res.status(204).send();
	} catch (err) {
		next(err);
	}
});

export default router;
