// Everything this app knows about the third-party Bob's Burgers API's base
// URL and request shape lives here — the hooks/fetch*.ts files just supply
// a path and a return type, they never build a fetch call themselves.

const BASE_URL = 'https://bobsburgers-api.herokuapp.com';

// The public API has no documented SLA, so a hung request needs a hard
// bound rather than waiting forever — generous enough for a slow mobile
// connection without leaving a screen stuck indefinitely.
const REQUEST_TIMEOUT_MS = 10000;

export async function fetchBobsBurgersApi<T>(path: string): Promise<T> {
	const controller = new AbortController();
	const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

	try {
		const response = await fetch(`${BASE_URL}${path}`, {
			signal: controller.signal,
		});

		if (!response.ok) {
			throw new Error(`Request failed with status ${response.status}`);
		}

		return (await response.json()) as T;
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			throw new Error('Request timed out. Please try again.');
		}
		throw error;
	} finally {
		clearTimeout(timeout);
	}
}
