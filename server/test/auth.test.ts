import { describe, it, expect, afterEach } from 'vitest';
import { api, uniqueEmail, deleteUserByEmail, TEST_PASSWORD } from './helpers.js';

describe('POST /auth/register', () => {
	const createdEmails: string[] = [];

	afterEach(async () => {
		for (const email of createdEmails.splice(0)) {
			await deleteUserByEmail(email);
		}
	});

	it('registers a new user and returns a token', async () => {
		const email = uniqueEmail();
		createdEmails.push(email);

		const res = await api
			.post('/auth/register')
			.send({ email, password: TEST_PASSWORD });

		expect(res.status).toBe(201);
		expect(typeof res.body.token).toBe('string');
	});

	it('rejects a duplicate email with 409', async () => {
		const email = uniqueEmail();
		createdEmails.push(email);

		await api.post('/auth/register').send({ email, password: TEST_PASSWORD });
		const res = await api
			.post('/auth/register')
			.send({ email, password: TEST_PASSWORD });

		expect(res.status).toBe(409);
	});
});

describe('POST /auth/login', () => {
	const createdEmails: string[] = [];

	afterEach(async () => {
		for (const email of createdEmails.splice(0)) {
			await deleteUserByEmail(email);
		}
	});

	it('logs in with correct credentials', async () => {
		const email = uniqueEmail();
		createdEmails.push(email);
		await api.post('/auth/register').send({ email, password: TEST_PASSWORD });

		const res = await api
			.post('/auth/login')
			.send({ email, password: TEST_PASSWORD });

		expect(res.status).toBe(200);
		expect(typeof res.body.token).toBe('string');
	});

	it('rejects the wrong password with 401', async () => {
		const email = uniqueEmail();
		createdEmails.push(email);
		await api.post('/auth/register').send({ email, password: TEST_PASSWORD });

		const res = await api
			.post('/auth/login')
			.send({ email, password: 'wrong-password' });

		expect(res.status).toBe(401);
	});
});
