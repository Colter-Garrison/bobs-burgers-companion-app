import request from 'supertest';
import { eq } from 'drizzle-orm';
import { app } from '../src/app.js';
import { db } from '../src/db/client.js';
import { users } from '../src/db/schema.js';

// Wraps the real Express app (no real port bound) so tests can make
// requests against it exactly like a real HTTP client would.
export const api = request(app);

// A fresh, collision-proof username per test — same idea
// scripts/smoke-test.sh already uses (a timestamp), plus a random suffix
// so tests running in parallel can't collide with each other either.
// Letters/numbers only (matches the real validation in routes/auth.ts)
// and well under the 25-character limit.
export function uniqueUsername(): string {
	return `test${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

export const TEST_PASSWORD = 'correct-horse-battery-staple';

// Registers a fresh user through the real /auth/register endpoint (not a
// direct DB insert), so every test built on this exercises the real
// hashing/token-signing path rather than assuming it works.
export async function registerTestUser() {
	const username = uniqueUsername();
	const res = await api
		.post('/auth/register')
		.send({ username, password: TEST_PASSWORD });
	return {
		username,
		password: TEST_PASSWORD,
		token: res.body.token as string,
	};
}

// Deletes a user directly via Drizzle — cascades to their favorites
// automatically via the existing onDelete: 'cascade' foreign key. Used
// in afterEach/afterAll to keep the real dev database clean between test
// runs.
export async function deleteUserByUsername(username: string) {
	await db.delete(users).where(eq(users.username, username));
}
