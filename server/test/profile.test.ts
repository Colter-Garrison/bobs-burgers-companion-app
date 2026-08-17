import { describe, it, expect } from 'vitest';
import { eq } from 'drizzle-orm';
import { db } from '../src/db/client.js';
import { favorites } from '../src/db/schema.js';
import { api, registerTestUser } from './helpers.js';

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
