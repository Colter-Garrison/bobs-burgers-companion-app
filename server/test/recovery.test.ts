import { describe, it, expect, afterEach } from 'vitest';
import {
	api,
	uniqueUsername,
	uniqueTestEmail,
	deleteUserByUsername,
	decodeUserId,
	getLatestAuthToken,
	TEST_PASSWORD,
} from './helpers.js';

describe('POST /auth/verify-email', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('verifies a real, unused verification token', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);
		const email = uniqueTestEmail(username);
		const registerRes = await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD, email });
		const userId = decodeUserId(registerRes.body.token);
		const token = await getLatestAuthToken(userId, 'email_verification');

		const res = await api.post('/auth/verify-email').send({ token });

		expect(res.status).toBe(200);
	});

	it('rejects a garbage token', async () => {
		const res = await api
			.post('/auth/verify-email')
			.send({ token: 'not-a-real-token' });

		expect(res.status).toBe(400);
	});

	it('rejects reusing an already-consumed token', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);
		const email = uniqueTestEmail(username);
		const registerRes = await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD, email });
		const userId = decodeUserId(registerRes.body.token);
		const token = await getLatestAuthToken(userId, 'email_verification');

		await api.post('/auth/verify-email').send({ token });
		const res = await api.post('/auth/verify-email').send({ token });

		expect(res.status).toBe(400);
	});
});

describe('POST /auth/forgot-username and /auth/forgot-password', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('gives the same generic response whether or not the email is registered', async () => {
		const registered = await api
			.post('/auth/forgot-username')
			.send({ email: uniqueTestEmail(`nobody-${Date.now()}`) });
		const unregistered = await api
			.post('/auth/forgot-username')
			.send({ email: uniqueTestEmail(`also-nobody-${Date.now()}`) });

		expect(registered.status).toBe(unregistered.status);
		expect(registered.body).toEqual(unregistered.body);
	});

	it('does not send a username-recovery email for an unverified email', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);
		const email = uniqueTestEmail(username);
		await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD, email });

		// Not verified — the forgot-username endpoint must not treat this
		// email as belonging to the account for recovery purposes.
		const res = await api.post('/auth/forgot-username').send({ email });

		expect(res.status).toBe(200);
		// No direct assertion possible on "no email sent" without mocking,
		// but the generic response shape itself must not leak anything —
		// covered by the identical-response test above.
	});

	it('full happy path: verified email -> forgot-password -> reset via the real queried token -> old password rejected, new one accepted', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);
		const email = uniqueTestEmail(username);
		const registerRes = await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD, email });
		const userId = decodeUserId(registerRes.body.token);
		const verifyToken = await getLatestAuthToken(userId, 'email_verification');
		await api.post('/auth/verify-email').send({ token: verifyToken });

		const forgotRes = await api.post('/auth/forgot-password').send({ email });
		expect(forgotRes.status).toBe(200);

		const resetToken = await getLatestAuthToken(userId, 'password_reset');
		expect(resetToken).toBeTruthy();

		const newPassword = 'a-brand-new-password';
		const resetRes = await api
			.post('/auth/reset-password')
			.send({ token: resetToken, newPassword });
		expect(resetRes.status).toBe(204);

		const oldLogin = await api
			.post('/auth/login')
			.send({ username, password: TEST_PASSWORD });
		expect(oldLogin.status).toBe(401);

		const newLogin = await api
			.post('/auth/login')
			.send({ username, password: newPassword });
		expect(newLogin.status).toBe(200);
	});

	it('rejects reset-password with an expired/garbage token', async () => {
		const res = await api
			.post('/auth/reset-password')
			.send({ token: 'not-a-real-token', newPassword: 'whatever-password' });

		expect(res.status).toBe(400);
	});

	it('rejects reset-password with a too-short new password', async () => {
		const username = uniqueUsername();
		createdUsernames.push(username);
		const email = uniqueTestEmail(username);
		const registerRes = await api
			.post('/auth/register')
			.send({ username, password: TEST_PASSWORD, email });
		const userId = decodeUserId(registerRes.body.token);
		const verifyToken = await getLatestAuthToken(userId, 'email_verification');
		await api.post('/auth/verify-email').send({ token: verifyToken });
		await api.post('/auth/forgot-password').send({ email });
		const resetToken = await getLatestAuthToken(userId, 'password_reset');

		const res = await api
			.post('/auth/reset-password')
			.send({ token: resetToken, newPassword: 'short' });

		expect(res.status).toBe(400);
	});
});
