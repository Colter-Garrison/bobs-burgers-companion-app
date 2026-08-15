import { describe, it, expect, afterEach } from 'vitest';
import { api, registerTestUser, deleteUserByEmail } from './helpers.js';

// GET /favorites is behind requireAuth like every other protected route —
// it's just a convenient one to exercise the middleware through, since
// it needs no request body.
describe('requireAuth middleware (via GET /favorites)', () => {
	const createdEmails: string[] = [];

	afterEach(async () => {
		for (const email of createdEmails.splice(0)) {
			await deleteUserByEmail(email);
		}
	});

	it('rejects a request with no Authorization header', async () => {
		const res = await api.get('/favorites');
		expect(res.status).toBe(401);
	});

	it('rejects a malformed Authorization header', async () => {
		const res = await api
			.get('/favorites')
			.set('Authorization', 'not-a-bearer-token');
		expect(res.status).toBe(401);
	});

	it('rejects a well-formed but invalid token', async () => {
		const res = await api
			.get('/favorites')
			.set('Authorization', 'Bearer this.is.garbage');
		expect(res.status).toBe(401);
	});

	it('rejects a valid token whose user was deleted after it was issued', async () => {
		const { email, token } = await registerTestUser();
		// Deleted directly, bypassing /profile — the token itself is
		// still cryptographically valid (unexpired, correctly signed);
		// only the user it names is gone.
		await deleteUserByEmail(email);

		const res = await api.get('/favorites').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(401);
	});

	it('allows a valid token for a user that still exists', async () => {
		const { email, token } = await registerTestUser();
		createdEmails.push(email);

		const res = await api.get('/favorites').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
	});
});
