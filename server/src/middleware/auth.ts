import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { verifyToken } from '../lib/jwt.js';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';

// Express middleware runs before the route handler for any route it's
// attached to. This one reads the "Authorization: Bearer <token>" header,
// verifies the token, and — if valid — attaches the user's id to the
// request so every route after this one can trust req.userId without
// re-checking auth itself. If the token's missing or invalid, it responds
// immediately and never calls next(), so the actual route handler never
// runs.
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
		// verifyToken throws for both an invalid signature (forged/
		// tampered token) and an expired one — either way, the caller
		// just needs to know the token isn't good, not why.
		return res.status(401).json({ error: 'Invalid or expired token' });
	}

	// A JWT stays cryptographically valid until it expires, regardless of
	// what happens to the account it names — deleting a user doesn't
	// invalidate tokens already issued to them. So a signature check
	// alone isn't enough; we also confirm the user still exists.
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
