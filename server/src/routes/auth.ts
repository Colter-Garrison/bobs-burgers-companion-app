import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { eq } from 'drizzle-orm';

const router = Router();

const credentialsSchema = z.object({
	// Letters and numbers only, 2-25 characters — matches the 25-char
	// limit on the users.username column itself (see db/schema.ts).
	username: z
		.string()
		.min(2, 'Username must be 2-25 characters')
		.max(25, 'Username must be 2-25 characters')
		.regex(/^[a-zA-Z0-9]+$/, 'Username can only contain letters and numbers'),
	password: z.string().min(8),
});

router.post('/register', async (req, res, next) => {
	const parsed = credentialsSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error.issues[0]?.message ?? 'Invalid username or password',
		});
	}
	const { username, password } = parsed.data;

	try {
		const passwordHash = await hashPassword(password);
		const [user] = await db
			.insert(users)
			.values({ username, passwordHash })
			.returning();

		const token = signToken({ userId: user.id });
		return res.status(201).json({ token });
	} catch (err: any) {
		if (err.code === '23505') {
			return res.status(409).json({ error: 'Username already taken' });
		}
		next(err);
	}
});

router.post('/login', async (req, res, next) => {
	const parsed = credentialsSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error.issues[0]?.message ?? 'Invalid username or password',
		});
	}
	const { username, password } = parsed.data;

	try {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.username, username));

		if (!user) {
			return res.status(401).json({ error: 'Invalid username or password' });
		}

		const passwordMatches = await verifyPassword(
			password,
			user.passwordHash,
		);
		if (!passwordMatches) {
			return res.status(401).json({ error: 'Invalid username or password' });
		}

		const token = signToken({ userId: user.id });
		return res.json({ token });
	} catch (err) {
		next(err);
	}
});

export default router;
