import { getBurgersOfTheDay } from './fetchBurgersOfTheDay';

describe('getBurgersOfTheDay', () => {
	beforeEach(() => {
		// Replace the real global fetch with a fake for every test in this
		// file, so no test makes a real network call. Each test then
		// controls exactly what that fake returns via
		// mockResolvedValueOnce/mockRejectedValueOnce below.
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('calls the correct URL and returns the parsed burgers', async () => {
		const mockBurgers = [{ id: 1, name: 'Test Burger' }];
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			json: async () => mockBurgers,
		});

		const result = await getBurgersOfTheDay();

		expect(global.fetch).toHaveBeenCalledWith(
			'https://bobsburgers-api.herokuapp.com/burgerOfTheDay/',
		);
		expect(result).toEqual(mockBurgers);
	});

	it('returns an empty array when the fetch fails', async () => {
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error('network down'),
		);

		const result = await getBurgersOfTheDay();

		expect(result).toEqual([]);
	});
});
