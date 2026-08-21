import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../lib/jwt.js';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';

export async function requireAuth(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	const authHeader = req.headers.authorization;
	if (!authHeader?.startsWith('Bearer ')) {
		return res
			.status(401)
			.json({ error: 'Missing or malformed Authorization header' });
	}

	const token = authHeader.slice('Bearer '.length);
	let payload;
	try {
		payload = verifyToken(token);
	} catch {
		return res.status(401).json({ error: 'Invalid or expired token' });
	}

	try {
		const [user] = await db
			.select({ id: users.id })
			.from(users)
			.where(eq(users.id, payload.userId));
		if (!user) {
			return res.status(401).json({ error: 'User no longer exists' });
		}
	} catch (err) {
		return next(err);
	}

	req.userId = payload.userId;
	next();
}
