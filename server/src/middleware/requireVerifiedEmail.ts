import type { Request, Response, NextFunction } from 'express';
import { eq } from 'drizzle-orm';
import { db } from '../db/client.js';
import { users } from '../db/schema.js';

export async function requireVerifiedEmail(
	req: Request,
	res: Response,
	next: NextFunction,
) {
	try {
		const [user] = await db
			.select({ emailVerifiedAt: users.emailVerifiedAt })
			.from(users)
			.where(eq(users.id, req.userId!));

		if (!user?.emailVerifiedAt) {
			return res
				.status(403)
				.json({ error: 'Verify an email address first' });
		}

		next();
	} catch (err) {
		next(err);
	}
}
