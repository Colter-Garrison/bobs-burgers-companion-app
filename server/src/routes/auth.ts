import { Router } from 'express';
import { z } from 'zod';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { signToken } from '../lib/jwt.js';
import { usernameSchema } from '../lib/validation.js';
import { issueEmailVerification } from '../lib/emailVerification.js';
import {
	sendPasswordResetEmail,
	sendUsernameRecoveryEmail,
} from '../lib/email.js';
import { consumeToken, createToken } from '../lib/tokens.js';
import { env } from '../env.js';
import { eq, and, isNotNull } from 'drizzle-orm';

const router = Router();

const credentialsSchema = z.object({
	username: usernameSchema,
	password: z.string().min(8),
	email: z.string().email('Invalid email address').optional(),
});

router.post('/register', async (req, res, next) => {
	const parsed = credentialsSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error.issues[0]?.message ?? 'Invalid username or password',
		});
	}
	const { username, password, email } = parsed.data;

	try {
		if (email) {
			const [existing] = await db
				.select({ id: users.id })
				.from(users)
				.where(eq(users.email, email));
			if (existing) {
				return res.status(409).json({ error: 'Email already in use' });
			}
		}

		const passwordHash = await hashPassword(password);
		const [user] = await db
			.insert(users)
			.values({ username, passwordHash })
			.returning();

		if (email) {
			await issueEmailVerification(user.id, email);
		}

		const token = signToken({ userId: user.id });
		return res.status(201).json({ token });
	} catch (err: any) {
		if (err.code === '23505') {
			if (err.constraint === 'users_email_unique') {
				return res.status(409).json({ error: 'Email already in use' });
			}
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

router.post('/verify-email', async (req, res, next) => {
	const parsed = z.object({ token: z.string() }).safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ error: 'Invalid or expired verification link' });
	}

	try {
		const userId = await consumeToken(parsed.data.token, 'email_verification');
		if (!userId) {
			return res
				.status(400)
				.json({ error: 'Invalid or expired verification link' });
		}

		await db
			.update(users)
			.set({ emailVerifiedAt: new Date() })
			.where(eq(users.id, userId));

		return res.json({ verified: true });
	} catch (err) {
		next(err);
	}
});

const emailOnlySchema = z.object({ email: z.string().email() });

const GENERIC_RECOVERY_MESSAGE =
	'If an account with that email exists, we’ve sent it.';

router.post('/forgot-username', async (req, res, next) => {
	const parsed = emailOnlySchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ error: 'Invalid email address' });
	}

	try {
		const [user] = await db
			.select()
			.from(users)
			.where(
				and(
					eq(users.email, parsed.data.email),
					isNotNull(users.emailVerifiedAt),
				),
			);

		if (user) {
			await sendUsernameRecoveryEmail(user.email!, user.username);
		}

		return res.json({ message: GENERIC_RECOVERY_MESSAGE });
	} catch (err) {
		next(err);
	}
});

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000; // 1 hour

router.post('/forgot-password', async (req, res, next) => {
	const parsed = emailOnlySchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({ error: 'Invalid email address' });
	}

	try {
		const [user] = await db
			.select()
			.from(users)
			.where(
				and(
					eq(users.email, parsed.data.email),
					isNotNull(users.emailVerifiedAt),
				),
			);

		if (user) {
			const token = await createToken(
				user.id,
				'password_reset',
				PASSWORD_RESET_TTL_MS,
			);
			if (token) {
				const resetUrl = `${env.WEB_APP_URL}/resetPassword?token=${token}`;
				await sendPasswordResetEmail(user.email!, resetUrl);
			}
		}

		return res.json({ message: GENERIC_RECOVERY_MESSAGE });
	} catch (err) {
		next(err);
	}
});

const resetPasswordSchema = z.object({
	token: z.string(),
	newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

router.post('/reset-password', async (req, res, next) => {
	const parsed = resetPasswordSchema.safeParse(req.body);
	if (!parsed.success) {
		return res.status(400).json({
			error: parsed.error.issues[0]?.message ?? 'Invalid request',
		});
	}

	try {
		const userId = await consumeToken(parsed.data.token, 'password_reset');
		if (!userId) {
			return res.status(400).json({ error: 'Invalid or expired reset link' });
		}

		const passwordHash = await hashPassword(parsed.data.newPassword);
		await db.update(users).set({ passwordHash }).where(eq(users.id, userId));

		return res.status(204).send();
	} catch (err) {
		next(err);
	}
});

export default router;
