import { describe, it, expect, afterEach } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/client.js';
import { favorites } from '../src/db/schema.js';
import {
	api,
	registerTestUser,
	registerVerifiedUser,
	uniqueUsername,
	uniqueTestEmail,
	deleteUserByUsername,
	TEST_PASSWORD,
} from './helpers.js';

describe('DELETE /profile', () => {
	it('deletes the user, cascades their favorites, and invalidates their token', async () => {
		const { token } = await registerTestUser();

		// Decode the token's payload just to get the userId for the direct
		// DB check below — no verification needed here, we trust it since
		// we just received it from our own /auth/register call.
		const payload = JSON.parse(
			Buffer.from(token.split('.')[1], 'base64').toString('utf8'),
		);
		const userId = payload.userId as number;

		await api
			.post('/favorites/burger')
			.set('Authorization', `Bearer ${token}`)
			.send({ itemId: 1 });
		await api
			.post('/favorites/character')
			.set('Authorization', `Bearer ${token}`)
			.send({ itemId: 2 });

		const deleteRes = await api
			.delete('/profile')
			.set('Authorization', `Bearer ${token}`);
		expect(deleteRes.status).toBe(204);

		// Query the favorites table directly, bypassing the API, to prove
		// the cascade delete actually fired at the database level — not
		// just that the /favorites endpoint now happens to return nothing
		// because the user itself is gone.
		const remainingFavorites = await db
			.select()
			.from(favorites)
			.where(eq(favorites.userId, userId));
		expect(remainingFavorites).toEqual([]);

		// The same token, reused after the account it names no longer
		// exists — this is the same "user no longer exists" case
		// requireAuth.test.ts covers, approached from the profile-delete
		// side instead of a direct DB delete.
		const staleRes = await api
			.get('/favorites')
			.set('Authorization', `Bearer ${token}`);
		expect(staleRes.status).toBe(401);
	});
});

describe('GET /profile', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('returns the username, email, and verification status', async () => {
		const { username, token, email } = await registerVerifiedUser();
		createdUsernames.push(username);

		const res = await api.get('/profile').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.username).toBe(username);
		expect(res.body.email).toBe(email);
		expect(res.body.emailVerifiedAt).toBeTruthy();
	});

	it('returns a null email/emailVerifiedAt for an account with no email', async () => {
		const { username, token } = await registerTestUser();
		createdUsernames.push(username);

		const res = await api.get('/profile').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body.email).toBeNull();
		expect(res.body.emailVerifiedAt).toBeNull();
	});
});

describe('PATCH /profile/username', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('rejects the change when the account has no verified email', async () => {
		const { username, token } = await registerTestUser();
		createdUsernames.push(username);

		const res = await api
			.patch('/profile/username')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldUsername: username, newUsername: uniqueUsername() });

		expect(res.status).toBe(403);
	});

	it('changes the username when oldUsername matches and the account has a verified email', async () => {
		const { username, token } = await registerVerifiedUser();
		createdUsernames.push(username);
		const newUsername = uniqueUsername();
		createdUsernames.push(newUsername);

		const res = await api
			.patch('/profile/username')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldUsername: username, newUsername });

		expect(res.status).toBe(200);
		expect(res.body.username).toBe(newUsername);

		const loginRes = await api
			.post('/auth/login')
			.send({ username: newUsername, password: TEST_PASSWORD });
		expect(loginRes.status).toBe(200);
	});

	it('rejects when oldUsername does not match the current username', async () => {
		const { username, token } = await registerVerifiedUser();
		createdUsernames.push(username);

		const res = await api
			.patch('/profile/username')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldUsername: 'not-the-real-username', newUsername: uniqueUsername() });

		expect(res.status).toBe(400);
	});

	it('rejects a duplicate newUsername with 409', async () => {
		const { username, token } = await registerVerifiedUser();
		createdUsernames.push(username);
		const { username: otherUsername } = await registerVerifiedUser();
		createdUsernames.push(otherUsername);

		const res = await api
			.patch('/profile/username')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldUsername: username, newUsername: otherUsername });

		expect(res.status).toBe(409);
	});

	it('rejects an invalid newUsername format with 400', async () => {
		const { username, token } = await registerVerifiedUser();
		createdUsernames.push(username);

		const res = await api
			.patch('/profile/username')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldUsername: username, newUsername: 'bad_username!' });

		expect(res.status).toBe(400);
	});
});

describe('PATCH /profile/password', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('rejects the change when the account has no verified email', async () => {
		const { username, token } = await registerTestUser();
		createdUsernames.push(username);

		const res = await api
			.patch('/profile/password')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldPassword: TEST_PASSWORD, newPassword: 'a-new-password' });

		expect(res.status).toBe(403);
	});

	it('changes the password: old password rejected, new one accepted', async () => {
		const { username, token } = await registerVerifiedUser();
		createdUsernames.push(username);
		const newPassword = 'a-brand-new-password';

		const res = await api
			.patch('/profile/password')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldPassword: TEST_PASSWORD, newPassword });

		expect(res.status).toBe(204);

		const oldLogin = await api
			.post('/auth/login')
			.send({ username, password: TEST_PASSWORD });
		expect(oldLogin.status).toBe(401);

		const newLogin = await api
			.post('/auth/login')
			.send({ username, password: newPassword });
		expect(newLogin.status).toBe(200);
	});

	it('rejects the wrong old password with 401', async () => {
		const { username, token } = await registerVerifiedUser();
		createdUsernames.push(username);

		const res = await api
			.patch('/profile/password')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldPassword: 'totally-wrong', newPassword: 'a-new-password' });

		expect(res.status).toBe(401);
	});

	it('rejects a too-short new password with 400', async () => {
		const { username, token } = await registerVerifiedUser();
		createdUsernames.push(username);

		const res = await api
			.patch('/profile/password')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldPassword: TEST_PASSWORD, newPassword: 'short' });

		expect(res.status).toBe(400);
	});
});

describe('PATCH /profile/email', () => {
	const createdUsernames: string[] = [];

	afterEach(async () => {
		for (const username of createdUsernames.splice(0)) {
			await deleteUserByUsername(username);
		}
	});

	it('adds an email with no oldEmail required when the account has none yet, and is not gated on having a verified email', async () => {
		const { username, token } = await registerTestUser();
		createdUsernames.push(username);
		const email = uniqueTestEmail(`${username}-added`);

		const res = await api
			.patch('/profile/email')
			.set('Authorization', `Bearer ${token}`)
			.send({ newEmail: email });

		expect(res.status).toBe(200);
		expect(res.body.email).toBe(email);
	});

	it('requires oldEmail to match the current email once one is set', async () => {
		const { username, token } = await registerVerifiedUser();
		createdUsernames.push(username);

		const res = await api
			.patch('/profile/email')
			.set('Authorization', `Bearer ${token}`)
			.send({
				oldEmail: uniqueTestEmail('wrong'),
				newEmail: uniqueTestEmail('new'),
			});

		expect(res.status).toBe(400);
	});

	it('changes the email (with a matching oldEmail) and resets it to unverified', async () => {
		const { username, token, email } = await registerVerifiedUser();
		createdUsernames.push(username);
		const newEmail = uniqueTestEmail(`${username}-changed`);

		const res = await api
			.patch('/profile/email')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldEmail: email, newEmail });

		expect(res.status).toBe(200);
		expect(res.body.email).toBe(newEmail);

		// Changing email is never instant — it must require re-verification
		// (and therefore re-gate username/password changes) even though
		// this account was previously verified.
		const changeUsernameRes = await api
			.patch('/profile/username')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldUsername: username, newUsername: uniqueUsername() });
		expect(changeUsernameRes.status).toBe(403);
	});

	it('rejects an email already in use by another account with 409', async () => {
		const { username, token, email } = await registerVerifiedUser();
		createdUsernames.push(username);
		const { username: otherUsername, email: otherEmail } =
			await registerVerifiedUser();
		createdUsernames.push(otherUsername);

		const res = await api
			.patch('/profile/email')
			.set('Authorization', `Bearer ${token}`)
			.send({ oldEmail: email, newEmail: otherEmail });

		expect(res.status).toBe(409);
	});
});
