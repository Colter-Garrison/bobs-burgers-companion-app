import {
	ApiError,
	addFavoriteRequest,
	fetchFavorites,
	loginUser,
	registerUser,
	removeFavoriteRequest,
} from './apiClient';

function mockJsonResponse(status: number, body: unknown) {
	return {
		status,
		ok: status >= 200 && status < 300,
		json: async () => body,
	};
}

function mockNoContentResponse() {
	return {
		status: 204,
		ok: true,
		json: async () => {
			throw new Error('204 responses have no body to parse');
		},
	};
}

describe('apiClient', () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('registerUser posts username/password and returns the token', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(201, { token: 'abc123' }),
		);

		const result = await registerUser('bobbelcher', 'burgerpass1');

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/auth/register'),
			expect.objectContaining({
				method: 'POST',
				headers: expect.objectContaining({
					'Content-Type': 'application/json',
				}),
				body: JSON.stringify({
					username: 'bobbelcher',
					password: 'burgerpass1',
				}),
			}),
		);
		expect(result).toEqual({ token: 'abc123' });
	});

	it('loginUser throws an ApiError carrying the status and message on failure', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(401, { error: 'Invalid username or password' }),
		);

		const result = loginUser('bobbelcher', 'wrong');

		await expect(result).rejects.toBeInstanceOf(ApiError);
		await expect(result).rejects.toMatchObject({
			status: 401,
			message: 'Invalid username or password',
		});
	});

	it('fetchFavorites sends the bearer token and returns the parsed list', async () => {
		const favorites = [
			{ id: 1, userId: 1, category: 'burger', itemId: 42, createdAt: 'now' },
		];
		(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, favorites),
		);

		const result = await fetchFavorites('token-xyz');

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/favorites'),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer token-xyz' }),
			}),
		);
		expect(result).toEqual(favorites);
	});

	it('addFavoriteRequest posts to the category-scoped route with itemId', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(201, {
				id: 1,
				userId: 1,
				category: 'burger',
				itemId: 42,
				createdAt: 'now',
			}),
		);

		await addFavoriteRequest('token-xyz', 'burger', 42);

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/favorites/burger'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ itemId: 42 }),
			}),
		);
	});

	it('removeFavoriteRequest does not attempt to parse a 204 response body', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce(mockNoContentResponse());

		const result = await removeFavoriteRequest('token-xyz', 'burger', 42);

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/favorites/burger/42'),
			expect.objectContaining({ method: 'DELETE' }),
		);
		expect(result).toBeUndefined();
	});
});
