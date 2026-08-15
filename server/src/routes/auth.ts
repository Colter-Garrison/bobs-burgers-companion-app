import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { eq } from 'drizzle-orm';

const router = Router();

const credentialsSchema = z.object({
	email: z.string().email(),
	// A minimum length here is just a basic sanity check, not a full
	// password-strength policy — that's a reasonable thing to add later,
	// not required for the hand-rolled-basics stage this is at now.
	password: z.string().min(8),
});

router.post('/register', async (req, res, next) => {
	const parsed = credentialsSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ error: 'Invalid email or password' });
	}
	const { email, password } = parsed.data;

	try {
		const passwordHash = await hashPassword(password);
		const [user] = await db
			.insert(users)
			.values({ email, passwordHash })
			.returning();

		const token = signToken({ userId: user.id });
		return res.status(201).json({ token });
	} catch (err: any) {
		// Postgres error code 23505 = unique_violation. Here that means
		// the users.email unique constraint was hit — someone already
		// registered with this email.
		if (err.code === '23505') {
			return res.status(409).json({ error: 'Email already registered' });
		}
		next(err);
	}
});

router.post('/login', async (req, res, next) => {
	const parsed = credentialsSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ error: 'Invalid email or password' });
	}
	const { email, password } = parsed.data;

	try {
		const [user] = await db
			.select()
			.from(users)
			.where(eq(users.email, email));

		// Deliberately the same error message whether the email doesn't
		// exist or the password is wrong — telling an attacker "that
		// email isn't registered" vs "wrong password" leaks which emails
		// have accounts.
		if (!user) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		const passwordMatches = await verifyPassword(
			password,
			user.passwordHash,
		);
		if (!passwordMatches) {
			return res.status(401).json({ error: 'Invalid email or password' });
		}

		const token = signToken({ userId: user.id });
		return res.json({ token });
	} catch (err) {
		next(err);
	}
});

export default router;
