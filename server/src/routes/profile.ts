import { Router } from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { requireAuth } from '../middleware/auth.js';
import { requireVerifiedEmail } from '../middleware/requireVerifiedEmail.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { usernameSchema } from '../lib/validation.js';
import { issueEmailVerification } from '../lib/emailVerification.js';

const router = Router();

router.use(requireAuth);

router.get('/', async (req, res, next) => {
	try {
		const [user] = await db
			.select({
				username: users.username,
				email: users.email,
				emailVerifiedAt: users.emailVerifiedAt,
			})
			.from(users)
			.where(eq(users.id, req.userId!));

		return res.json(user);
	} catch (err) {
		next(err);
	}
});

const updateUsernameSchema = z.object({
	oldUsername: z.string(),
	newUsername: usernameSchema,
});

router.patch('/username', requireVerifiedEmail, async (req, res, next) => {
	const parsed = updateUsernameSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error.issues[0]?.message ?? 'Invalid username',
		});
	}
	const { oldUsername, newUsername } = parsed.data;

	try {
		const [current] = await db
			.select({ username: users.username })
			.from(users)
			.where(eq(users.id, req.userId!));

		if (current?.username !== oldUsername) {
			return res
				.status(400)
				.json({ error: 'That doesn’t match your current username' });
		}

		const [updated] = await db
			.update(users)
			.set({ username: newUsername })
			.where(eq(users.id, req.userId!))
			.returning();

		return res.json({ username: updated.username });
	} catch (err: any) {
		if (err.code === '23505') {
			return res.status(409).json({ error: 'Username already taken' });
		}
		next(err);
	}
});

const updatePasswordSchema = z.object({
	oldPassword: z.string(),
	newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

router.patch('/password', requireVerifiedEmail, async (req, res, next) => {
	const parsed = updatePasswordSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error.issues[0]?.message ?? 'Invalid password',
		});
	}
	const { oldPassword, newPassword } = parsed.data;

	try {
		const [current] = await db
			.select()
			.from(users)
			.where(eq(users.id, req.userId!));

		const oldMatches = await verifyPassword(oldPassword, current.passwordHash);
		if (!oldMatches) {
			return res.status(401).json({ error: 'Current password is incorrect' });
		}

		const passwordHash = await hashPassword(newPassword);
		await db
			.update(users)
			.set({ passwordHash })
			.where(eq(users.id, req.userId!));

		return res.status(204).send();
	} catch (err) {
		next(err);
	}
});

const updateEmailSchema = z.object({
	oldEmail: z.string().optional(),
	newEmail: z.string().email('Invalid email address'),
});

router.patch('/email', async (req, res, next) => {
	const parsed = updateEmailSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error.issues[0]?.message ?? 'Invalid email address',
		});
	}
	const { oldEmail, newEmail } = parsed.data;

	try {
		const [current] = await db
			.select({ email: users.email })
			.from(users)
			.where(eq(users.id, req.userId!));

		if (current?.email) {
			if (oldEmail !== current.email) {
				return res
					.status(400)
					.json({ error: 'That doesn’t match your current email' });
			}
		}

		if (newEmail !== current?.email) {
			const [existing] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, newEmail));
			if (existing) {
				return res.status(409).json({ error: 'Email already in use' });
			}
		}

		await issueEmailVerification(req.userId!, newEmail);

		return res.json({ email: newEmail });
	} catch (err: any) {
		if (err.code === '23505') {
			return res.status(409).json({ error: 'Email already in use' });
		}
		next(err);
	}
});

router.delete('/', async (req, res, next) => {
	try {
		await db.delete(users).where(eq(users.id, req.userId!));
		return res.status(204).send();
	} catch (err) {
		next(err);
	}
});

export default router;
