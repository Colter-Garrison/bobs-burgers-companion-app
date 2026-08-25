const API_URL = process.env.EXPO_PUBLIC_API_URL

export class ApiError extends Error {
	status: number

	constructor(status: number, message: string) {
		super(message)
		this.status = status
	}
}

interface RequestOptions {
	method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
	body?: unknown
	token?: string | null
}

async function apiFetch<T>(
	path: string,
	options: RequestOptions = {},
): Promise<T> {
	const headers: Record<string, string> = {}
	if (options.body !== undefined) {
		headers['Content-Type'] = 'application/json'
	}
	if (options.token) {
		headers.Authorization = `Bearer ${options.token}`
	}

	const response = await fetch(`${API_URL}${path}`, {
		method: options.method ?? 'GET',
		headers,
		body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
	})

	if (response.status === 204) {
		return undefined as T
	}

	const data = await response.json().catch(() => null)

	if (!response.ok) {
		throw new ApiError(response.status, data?.error ?? 'Request failed')
	}

	return data as T
}

export interface AuthResponse {
	token: string
}

export function registerUser(
	username: string,
	password: string,
	email?: string,
) {
	return apiFetch<AuthResponse>('/auth/register', {
		method: 'POST',
		body: email ? { username, password, email } : { username, password },
	})
}

export function loginUser(username: string, password: string) {
	return apiFetch<AuthResponse>('/auth/login', {
		method: 'POST',
		body: { username, password },
	})
}

export function requestUsernameRecovery(email: string) {
	return apiFetch<{ message: string }>('/auth/forgot-username', {
		method: 'POST',
		body: { email },
	})
}

export function requestPasswordReset(email: string) {
	return apiFetch<{ message: string }>('/auth/forgot-password', {
		method: 'POST',
		body: { email },
	})
}

export function resetPassword(token: string, newPassword: string) {
	return apiFetch<void>('/auth/reset-password', {
		method: 'POST',
		body: { token, newPassword },
	})
}

export function verifyEmail(verificationToken: string) {
	return apiFetch<{ verified: boolean }>('/auth/verify-email', {
		method: 'POST',
		body: { token: verificationToken },
	})
}

export type FavoriteCategory =
	| 'burger'
	| 'character'
	| 'end_credit'
	| 'episode'
	| 'pest_control_truck'
	| 'store'

export interface Favorite {
	id: number
	userId: number
	category: FavoriteCategory
	itemId: number
	createdAt: string
}

export function fetchFavorites(token: string) {
	return apiFetch<Favorite[]>('/favorites', { token })
}

export function addFavoriteRequest(
	token: string,
	category: FavoriteCategory,
	itemId: number,
) {
	return apiFetch<Favorite>(`/favorites/${category}`, {
		method: 'POST',
		token,
		body: { itemId },
	})
}

export function removeFavoriteRequest(
	token: string,
	category: FavoriteCategory,
	itemId: number,
) {
	return apiFetch<void>(`/favorites/${category}/${itemId}`, {
		method: 'DELETE',
		token,
	})
}

export interface Profile {
	username: string
	email: string | null
	emailVerifiedAt: string | null
}

export function fetchProfile(token: string) {
	return apiFetch<Profile>('/profile', { token })
}

export function deleteAccountRequest(token: string) {
	return apiFetch<void>('/profile', { method: 'DELETE', token })
}

export function updateUsernameRequest(
	token: string,
	oldUsername: string,
	newUsername: string,
) {
	return apiFetch<{ username: string }>('/profile/username', {
		method: 'PATCH',
		token,
		body: { oldUsername, newUsername },
	})
}

export function updatePasswordRequest(
	token: string,
	oldPassword: string,
	newPassword: string,
) {
	return apiFetch<void>('/profile/password', {
		method: 'PATCH',
		token,
		body: { oldPassword, newPassword },
	})
}

export function updateEmailRequest(
	token: string,
	newEmail: string,
	oldEmail?: string,
) {
	return apiFetch<{ email: string }>('/profile/email', {
		method: 'PATCH',
		token,
		body: oldEmail ? { oldEmail, newEmail } : { newEmail },
	})
}
