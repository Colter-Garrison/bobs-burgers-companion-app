import crypto from 'crypto';
import { and, desc, eq, isNull } from 'drizzle-orm';
import { db } from '../db/client.js';
import { authTokens } from '../db/schema.js';

type TokenPurpose = (typeof authTokens.$inferSelect)['purpose'];

const REISSUE_COOLDOWN_MS = 60_000;

export async function createToken(
	userId: number,
	purpose: TokenPurpose,
	ttlMs: number,
	options?: { skipCooldown?: boolean },
): Promise<string | null> {
	if (!options?.skipCooldown) {
		const [recent] = await db
			.select()
			.from(authTokens)
			.where(
				and(
					eq(authTokens.userId, userId),
					eq(authTokens.purpose, purpose),
					isNull(authTokens.usedAt),
				),
			)
			.orderBy(desc(authTokens.createdAt))
			.limit(1);

		if (
			recent &&
			Date.now() - recent.createdAt.getTime() < REISSUE_COOLDOWN_MS
		) {
			return null;
		}
	}

	await db
		.delete(authTokens)
		.where(
			and(
				eq(authTokens.userId, userId),
				eq(authTokens.purpose, purpose),
				isNull(authTokens.usedAt),
			),
		);

	const token = crypto.randomBytes(32).toString('hex');
	await db.insert(authTokens).values({
		userId,
		purpose,
		token,
		expiresAt: new Date(Date.now() + ttlMs),
	});

	return token;
}

export async function consumeToken(
	token: string,
	purpose: TokenPurpose,
): Promise<number | null> {
	const [found] = await db
		.select()
		.from(authTokens)
		.where(and(eq(authTokens.token, token), eq(authTokens.purpose, purpose)));

	if (!found || found.usedAt || found.expiresAt.getTime() < Date.now()) {
		return null;
	}

	await db
		.update(authTokens)
		.set({ usedAt: new Date() })
		.where(eq(authTokens.id, found.id));

	return found.userId;
}
