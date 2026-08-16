// Everything this app knows about the server/ backend's URL paths and
// request/response shapes lives here — hooks call these functions, they
// never build a fetch call or a URL string themselves.

const API_URL = process.env.EXPO_PUBLIC_API_URL;

export class ApiError extends Error {
	status: number;

	constructor(status: number, message: string) {
		super(message);
		this.status = status;
	}
}

interface RequestOptions {
	method?: 'GET' | 'POST' | 'DELETE';
	body?: unknown;
	token?: string | null;
}

async function apiFetch<T>(
	path: string,
	options: RequestOptions = {},
): Promise<T> {
	const headers: Record<string, string> = {};
	if (options.body !== undefined) {
		headers['Content-Type'] = 'application/json';
	}
	if (options.token) {
		headers.Authorization = `Bearer ${options.token}`;
	}

	const response = await fetch(`${API_URL}${path}`, {
		method: options.method ?? 'GET',
		headers,
		body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
	});

	// A 204 (e.g. DELETE /favorites/:category/:itemId) has no body to
	// parse — calling response.json() on it throws.
	if (response.status === 204) {
		return undefined as T;
	}

	const data = await response.json().catch(() => null);

	if (!response.ok) {
		throw new ApiError(response.status, data?.error ?? 'Request failed');
	}

	return data as T;
}

export interface AuthResponse {
	token: string;
}

export function registerUser(email: string, password: string) {
	return apiFetch<AuthResponse>('/auth/register', {
		method: 'POST',
		body: { email, password },
	});
}

export function loginUser(email: string, password: string) {
	return apiFetch<AuthResponse>('/auth/login', {
		method: 'POST',
		body: { email, password },
	});
}

export type FavoriteCategory =
	| 'burger'
	| 'character'
	| 'end_credit'
	| 'episode'
	| 'pest_control_truck'
	| 'store';

export interface Favorite {
	id: number;
	userId: number;
	category: FavoriteCategory;
	itemId: number;
	createdAt: string;
}

export function fetchFavorites(token: string) {
	return apiFetch<Favorite[]>('/favorites', { token });
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
	});
}

export function removeFavoriteRequest(
	token: string,
	category: FavoriteCategory,
	itemId: number,
) {
	return apiFetch<void>(`/favorites/${category}/${itemId}`, {
		method: 'DELETE',
		token,
	});
}
