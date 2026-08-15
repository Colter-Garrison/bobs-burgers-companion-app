import request from 'supertest';
import { eq } from 'drizzle-orm';
import { app } from '../src/app.js';
import { db } from '../src/db/client.js';
import { users } from '../src/db/schema.js';

// Wraps the real Express app (no real port bound) so tests can make
// requests against it exactly like a real HTTP client would.
export const api = request(app);

// A fresh, collision-proof email per test — same idea
// scripts/smoke-test.sh already uses (a timestamp), plus a random suffix
// so tests running in parallel can't collide with each other either.
export function uniqueEmail(): string {
	return `test+${Date.now()}-${Math.random().toString(36).slice(2)}@example.com`;
}

export const TEST_PASSWORD = 'correct-horse-battery-staple';

// Registers a fresh user through the real /auth/register endpoint (not a
// direct DB insert), so every test built on this exercises the real
// hashing/token-signing path rather than assuming it works.
export async function registerTestUser() {
	const email = uniqueEmail();
	const res = await api
		.post('/auth/register')
		.send({ email, password: TEST_PASSWORD });
	return { email, password: TEST_PASSWORD, token: res.body.token as string };
}

// Deletes a user directly via Drizzle — cascades to their favorites
// automatically via the existing onDelete: 'cascade' foreign key. Used
// in afterEach/afterAll to keep the real dev database clean between test
// runs.
export async function deleteUserByEmail(email: string) {
	await db.delete(users).where(eq(users.email, email));
}
