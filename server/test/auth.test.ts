import { describe, it, expect, afterEach } from 'vitest';
import {
	api,
	uniqueUsername,
	uniqueTestEmail,
	deleteUserByUsername,
	TEST_PASSWORD,
} from './helpers.js';

describe('POST /auth/register', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('registers a new user and returns a token', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);

		const res = await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD });

		expect(res.status).toBe(201);
		expect(typeof res.body.token).toBe('string');
	});

	it('rejects a duplicate username with 409', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);

		await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD });
		const res = await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD });

		expect(res.status).toBe(409);
	});

	it('rejects a username shorter than 2 characters', async () => {
		const res = await api
			.post('/auth/register')
			.send({ username: 'a', password: TEST_PASSWORD });

		expect(res.status).toBe(400);
	});

	it('rejects a username longer than 25 characters', async () => {
		const res = await api
			.post('/auth/register')
			.send({ username: 'a'.repeat(26), password: TEST_PASSWORD });

		expect(res.status).toBe(400);
	});

	it('rejects a username containing characters other than letters/numbers', async () => {
		const res = await api
			.post('/auth/register')
			.send({ username: 'bob_belcher', password: TEST_PASSWORD });

		expect(res.status).toBe(400);
	});

	it('rejects a password shorter than 8 characters with a message naming the password, not zod\'s generic default', async () => {
		const res = await api
			.post('/auth/register')
			.send({ username: uniqueUsername(), password: 'short' });

		expect(res.status).toBe(400);
		expect(res.body.error).toBe('Password must be at least 8 characters');
	});

	it('accepts an optional email and leaves it unverified until the link is clicked', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);
		const email = uniqueTestEmail(username);

		const res = await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD, email });

		expect(res.status).toBe(201);

		// Not verified yet — username/password changes must still be gated.
		const patchRes = await api
			.patch('/profile/username')
			.set('Authorization', `Bearer ${res.body.token}`)
			.send({ oldUsername: username, newUsername: uniqueUsername() });
		expect(patchRes.status).toBe(403);
	});

	it('rejects an invalid email format with 400', async () => {
		const res = await api
			.post('/auth/register')
			.send({
				username: uniqueUsername(),
				password: TEST_PASSWORD,
				email: 'not-an-email',
			});

		expect(res.status).toBe(400);
	});

	it('rejects registering with an email already used by another account, with 409', async () => {
		const firstUsername = uniqueUsername();
		createdUsernames.push(firstUsername);
		const email = uniqueTestEmail(firstUsername);
		await api
			.post('/auth/register')
			.send({ username: firstUsername, password: TEST_PASSWORD, email });

		const secondUsername = uniqueUsername();
		const res = await api
			.post('/auth/register')
			.send({ username: secondUsername, password: TEST_PASSWORD, email });

		expect(res.status).toBe(409);
		expect(res.body.error).toMatch(/email/i);
	});
});

describe('POST /auth/login', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('logs in with correct credentials', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);
		await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD });

		const res = await api
			.post('/auth/login')
			.send({ username, password: TEST_PASSWORD });

		expect(res.status).toBe(200);
		expect(typeof res.body.token).toBe('string');
	});

	it('rejects the wrong password with 401', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);
		await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD });

		const res = await api
			.post('/auth/login')
			.send({ username, password: 'wrong-password' });

		expect(res.status).toBe(401);
	});
});
