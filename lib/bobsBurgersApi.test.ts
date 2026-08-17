import { fetchBobsBurgersApi } from './bobsBurgersApi';

function mockJsonResponse(status: number, body: unknown) {
	return {
		status,
		ok: status >= 200 && status < 300,
		json: async () => body,
	};
}

describe('fetchBobsBurgersApi', () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('returns the parsed JSON on a successful response', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(200, [{ id: 1 }]),
		);

		const result = await fetchBobsBurgersApi('/burgerOfTheDay/');

		expect(global.fetch).toHaveBeenCalledWith(
			'https://bobsburgers-api.herokuapp.com/burgerOfTheDay/',
			expect.objectContaining({ signal: expect.anything() }),
		);
		expect(result).toEqual([{ id: 1 }]);
	});

	it('throws when the response is not ok', async () => {
		(global.fetch as jest.Mock).mockResolvedValueOnce(
			mockJsonResponse(500, { error: 'Server error' }),
		);

		await expect(fetchBobsBurgersApi('/burgerOfTheDay/')).rejects.toThrow(
			'Request failed with status 500',
		);
	});

	it('rethrows a network error as-is', async () => {
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error('network down'),
		);

		await expect(fetchBobsBurgersApi('/burgerOfTheDay/')).rejects.toThrow(
			'network down',
		);
	});

	it('aborts and throws a timeout error if the request takes too long', async () => {
		jest.useFakeTimers();
		(global.fetch as jest.Mock).mockImplementation(
			(_url: string, { signal }: { signal: AbortSignal }) =>
				new Promise((_resolve, reject) => {
					signal.addEventListener('abort', () => {
						const abortError = new Error('Aborted');
						abortError.name = 'AbortError';
						reject(abortError);
					});
				}),
		);

		const promise = fetchBobsBurgersApi('/burgerOfTheDay/');
		const assertion = expect(promise).rejects.toThrow(
			'Request timed out. Please try again.',
		);
		jest.advanceTimersByTime(10000);
		await assertion;

		jest.useRealTimers();
	});
});
