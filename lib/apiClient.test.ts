import {
	ApiError,
	addFavoriteRequest,
	fetchFavorites,
	fetchProfile,
	loginUser,
	registerUser,
	removeFavoriteRequest,
	requestPasswordReset,
	requestUsernameRecovery,
	resetPassword,
	updateEmailRequest,
	updatePasswordRequest,
	updateUsernameRequest,
	verifyEmail,
} from './apiClient'

function mockJsonResponse(status: number, body: unknown) {
	return {
		status,
		ok: status >= 200 && status < 300,
		json: async () => body,
	}
}

function mockNoContentResponse() {
	return {
		status: 204,
		ok: true,
		json: async () => {
			throw new Error('204 responses have no body to parse')
		},
	}
}

describe('apiClient', () => {
	beforeEach(() => {
		global.fetch = jest.fn()
	})

	afterEach(() => {
		jest.restoreAllMocks()
	})

	it('registerUser posts username/password (no email) and returns the token', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(201, { token: 'abc123' }),
		)

		const result = await registerUser('bobbelcher', 'burgerpass1')

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
		)
		expect(result).toEqual({ token: 'abc123' })
	})

	it('registerUser includes an email in the body when provided', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(201, { token: 'abc123' }),
		)

		await registerUser('bobbelcher', 'burgerpass1', 'bob@example.com')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/auth/register'),
			expect.objectContaining({
				body: JSON.stringify({
					username: 'bobbelcher',
					password: 'burgerpass1',
					email: 'bob@example.com',
				}),
			}),
		)
	})

	it('loginUser throws an ApiError carrying the status and message on failure', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(401, { error: 'Invalid username or password' }),
		)

		const result = loginUser('bobbelcher', 'wrong')

		await expect(result).rejects.toBeInstanceOf(ApiError)
		await expect(result).rejects.toMatchObject({
			status: 401,
			message: 'Invalid username or password',
		})
	})

	it('fetchFavorites sends the bearer token and returns the parsed list', async () => {
		const favorites = [
			{ id: 1, userId: 1, category: 'burger', itemId: 42, createdAt: 'now' },
		]
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, favorites),
		)

		const result = await fetchFavorites('token-xyz')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/favorites'),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer token-xyz' }),
			}),
		)
		expect(result).toEqual(favorites)
	})

	it('addFavoriteRequest posts to the category-scoped route with itemId', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(201, {
				id: 1,
				userId: 1,
				category: 'burger',
				itemId: 42,
				createdAt: 'now',
			}),
		)

		await addFavoriteRequest('token-xyz', 'burger', 42)

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/favorites/burger'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ itemId: 42 }),
			}),
		)
	})

	it('removeFavoriteRequest does not attempt to parse a 204 response body', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(mockNoContentResponse())

		const result = await removeFavoriteRequest('token-xyz', 'burger', 42)

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/favorites/burger/42'),
			expect.objectContaining({ method: 'DELETE' }),
		)
		expect(result).toBeUndefined()
	})

	it('fetchProfile sends the bearer token and returns the parsed profile', async () => {
		const profile = {
			username: 'bobbelcher',
			email: 'bob@example.com',
			emailVerifiedAt: '2024-01-01T00:00:00.000Z',
		}
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, profile),
		)

		const result = await fetchProfile('token-xyz')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/profile'),
			expect.objectContaining({
				headers: expect.objectContaining({ Authorization: 'Bearer token-xyz' }),
			}),
		)
		expect(result).toEqual(profile)
	})

	it('updateUsernameRequest PATCHes oldUsername/newUsername', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, { username: 'newbelcher' }),
		)

		const result = await updateUsernameRequest(
			'token-xyz',
			'bobbelcher',
			'newbelcher',
		)

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/profile/username'),
			expect.objectContaining({
				method: 'PATCH',
				body: JSON.stringify({
					oldUsername: 'bobbelcher',
					newUsername: 'newbelcher',
				}),
			}),
		)
		expect(result).toEqual({ username: 'newbelcher' })
	})

	it('updatePasswordRequest PATCHes oldPassword/newPassword', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(mockNoContentResponse())

		await updatePasswordRequest('token-xyz', 'old-pass', 'new-pass')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/profile/password'),
			expect.objectContaining({
				method: 'PATCH',
				body: JSON.stringify({
					oldPassword: 'old-pass',
					newPassword: 'new-pass',
				}),
			}),
		)
	})

	it('updateEmailRequest PATCHes with just newEmail when there is no oldEmail', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, { email: 'new@example.com' }),
		)

		await updateEmailRequest('token-xyz', 'new@example.com')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/profile/email'),
			expect.objectContaining({
				method: 'PATCH',
				body: JSON.stringify({ newEmail: 'new@example.com' }),
			}),
		)
	})

	it('updateEmailRequest PATCHes with oldEmail/newEmail when oldEmail is provided', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, { email: 'new@example.com' }),
		)

		await updateEmailRequest('token-xyz', 'new@example.com', 'old@example.com')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/profile/email'),
			expect.objectContaining({
				method: 'PATCH',
				body: JSON.stringify({
					oldEmail: 'old@example.com',
					newEmail: 'new@example.com',
				}),
			}),
		)
	})

	it('requestUsernameRecovery posts the email to /auth/forgot-username', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, { message: 'generic message' }),
		)

		const result = await requestUsernameRecovery('bob@example.com')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/auth/forgot-username'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ email: 'bob@example.com' }),
			}),
		)
		expect(result).toEqual({ message: 'generic message' })
	})

	it('requestPasswordReset posts the email to /auth/forgot-password', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, { message: 'generic message' }),
		)

		await requestPasswordReset('bob@example.com')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/auth/forgot-password'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ email: 'bob@example.com' }),
			}),
		)
	})

	it('resetPassword posts the token and newPassword to /auth/reset-password', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(mockNoContentResponse())

		await resetPassword('reset-token', 'a-new-password')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/auth/reset-password'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({
					token: 'reset-token',
					newPassword: 'a-new-password',
				}),
			}),
		)
	})

	it('verifyEmail posts the verification token to /auth/verify-email', async () => {
		;(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, { verified: true }),
		)

		const result = await verifyEmail('verification-token')

		expect(global.fetch).toHaveBeenCalledWith(
			expect.stringContaining('/auth/verify-email'),
			expect.objectContaining({
				method: 'POST',
				body: JSON.stringify({ token: 'verification-token' }),
			}),
		)
		expect(result).toEqual({ verified: true })
	})
})
