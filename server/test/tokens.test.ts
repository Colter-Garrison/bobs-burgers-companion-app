import { describe, it, expect, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { createToken, consumeToken } from '../src/lib/tokens.js';
import { db } from '../src/db/client.js';
import { authTokens } from '../src/db/schema.js';
import { registerTestUser, deleteUserByUsername, decodeUserId } from './helpers.js';

describe('createToken / consumeToken', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('creates a single-use token that consumeToken accepts exactly once', async () => {
		const { username, token: authToken } = await registerTestUser();
		createdUsernames.push(username);
		const userId = decodeUserId(authToken);

		const token = await createToken(userId, 'email_verification', 60_000);
		expect(token).toEqual(expect.any(String));

		const firstUse = await consumeToken(token!, 'email_verification');
		expect(firstUse).toBe(userId);

		const secondUse = await consumeToken(token!, 'email_verification');
		expect(secondUse).toBeNull();
	});

	it('rejects an expired token', async () => {
		const { username, token: authToken } = await registerTestUser();
		createdUsernames.push(username);
		const userId = decodeUserId(authToken);

		const token = await createToken(userId, 'password_reset', -1);

		const result = await consumeToken(token!, 'password_reset');
		expect(result).toBeNull();
	});

	it('rejects a garbage token', async () => {
		const result = await consumeToken('not-a-real-token', 'email_verification');
		expect(result).toBeNull();
	});

	it('rejects a real token consumed under the wrong purpose', async () => {
		const { username, token: authToken } = await registerTestUser();
		createdUsernames.push(username);
		const userId = decodeUserId(authToken);

		const token = await createToken(userId, 'email_verification', 60_000);

		const result = await consumeToken(token!, 'password_reset');
		expect(result).toBeNull();
	});

	it('invalidates the previous unused token of the same purpose when issuing a new one', async () => {
		const { username, token: authToken } = await registerTestUser();
		createdUsernames.push(username);
		const userId = decodeUserId(authToken);

		const first = await createToken(userId, 'password_reset', 60_000);
		await db
			.update(authTokens)
			.set({ createdAt: new Date(Date.now() - 120_000) })
			.where(eq(authTokens.token, first!));

		const second = await createToken(userId, 'password_reset', 60_000);
		expect(second).not.toBeNull();
		expect(second).not.toBe(first);

		const firstResult = await consumeToken(first!, 'password_reset');
		expect(firstResult).toBeNull();
	});

	it('does not issue a new token within the reissue cooldown, returning null instead', async () => {
		const { username, token: authToken } = await registerTestUser();
		createdUsernames.push(username);
		const userId = decodeUserId(authToken);

		const first = await createToken(userId, 'email_verification', 60_000);
		expect(first).not.toBeNull();

		const second = await createToken(userId, 'email_verification', 60_000);
		expect(second).toBeNull();

		const result = await consumeToken(first!, 'email_verification');
		expect(result).toBe(userId);
	});
});
