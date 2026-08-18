import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { api, registerTestUser, deleteUserByUsername } from './helpers.js';

describe('favorites', () => {
	let username: string;
	let token: string;

	beforeAll(async () => {
		const user = await registerTestUser();
		username = user.username;
		token = user.token;
	});

	afterAll(async () => {
		await deleteUserByUsername(username);
	});

	it('adds a favorite', async () => {
		const res = await api
			.post('/favorites/burger')
			.set('Authorization', `Bearer ${token}`)
			.send({ itemId: 1 });

		expect(res.status).toBe(201);
		expect(res.body).toMatchObject({ category: 'burger', itemId: 1 });
	});

	it('lists the favorite just added', async () => {
		const res = await api.get('/favorites').set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(200);
		expect(res.body).toEqual(
			expect.arrayContaining([expect.objectContaining({ category: 'burger', itemId: 1 })]),
		);
	});

	it('rejects adding the same favorite again with 409', async () => {
		const res = await api
			.post('/favorites/burger')
			.set('Authorization', `Bearer ${token}`)
			.send({ itemId: 1 });

		expect(res.status).toBe(409);
	});

	it('rejects an invalid category with 400', async () => {
		const res = await api
			.post('/favorites/not-a-real-category')
			.set('Authorization', `Bearer ${token}`)
			.send({ itemId: 1 });

		expect(res.status).toBe(400);
	});

	it('removes the favorite', async () => {
		const res = await api
			.delete('/favorites/burger/1')
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(204);
	});

	it('returns 404 removing an already-removed favorite', async () => {
		const res = await api
			.delete('/favorites/burger/1')
			.set('Authorization', `Bearer ${token}`);

		expect(res.status).toBe(404);
	});
});
