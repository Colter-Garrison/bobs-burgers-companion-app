import { describe, it, expect, afterEach } from 'vitest';
import {
	api,
	uniqueUsername,
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
