import request from 'supertest';
import { and, desc, eq } from 'drizzle-orm';
import { app } from '../src/app.js';
import { db } from '../src/db/client.js';
import { authTokens, users } from '../src/db/schema.js';

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

// Resend blocks sends to made-up domains like @example.com with a 422
// ("these domains ... often reject messages, leading to bounces" — a
// real bounce from exactly this pattern is what surfaced the issue).
// delivered@resend.dev is one of Resend's own sanctioned test addresses
// and supports +label suffixes for uniqueness — needed here since
// users.email is unique — unlike its suppressed@resend.dev sibling,
// which doesn't support labeling. NODE_ENV=test already forces
// lib/email.ts's console-log fallback (see env.ts), so nothing here
// actually reaches Resend today — this is about the test data itself
// being realistic/safe regardless, not a live network concern.
export function uniqueTestEmail(label: string): string {
	return `delivered+${label}@resend.dev`;
}

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

// Decodes a JWT's payload without verifying it — only ever used in tests
// on a token we just received from our own /auth endpoints, so trust is
// already established; this is just a convenient way to get the userId
// back out for a direct DB check.
export function decodeUserId(token: string): number {
	const payload = JSON.parse(
		Buffer.from(token.split('.')[1], 'base64').toString('utf8'),
	);
	return payload.userId as number;
}

// Reads the actual token value straight out of the auth_tokens table —
// this is how tests exercise the email-verification/password-reset flows
// end to end without mocking email sending at all: trigger the request
// that would normally email a link, then fetch the real token this same
// way a person would get it by clicking the link in their inbox.
export async function getLatestAuthToken(
	userId: number,
	purpose: 'email_verification' | 'password_reset',
): Promise<string | undefined> {
	const [row] = await db
		.select()
		.from(authTokens)
		.where(and(eq(authTokens.userId, userId), eq(authTokens.purpose, purpose)))
		.orderBy(desc(authTokens.createdAt))
		.limit(1);
	return row?.token;
}

// Registers a user with an email and fully verifies it via the real
// /auth/verify-email endpoint (token fetched directly from the DB, as
// above) — the fixture most of the new profile/recovery tests need,
// since username/password changes are gated on a verified email.
export async function registerVerifiedUser() {
	const username = uniqueUsername();
	const email = uniqueTestEmail(username);
	const res = await api
		.post('/auth/register')
		.send({ username, password: TEST_PASSWORD, email });
	const token = res.body.token as string;
	const userId = decodeUserId(token);

	const verificationToken = await getLatestAuthToken(
		userId,
		'email_verification',
	);
	await api.post('/auth/verify-email').send({ token: verificationToken });

	return { username, password: TEST_PASSWORD, email, token, userId };
}
