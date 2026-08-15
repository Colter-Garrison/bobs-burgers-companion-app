import { getCharacters } from './fetchCharacters';

describe('getCharacters', () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('calls the correct URL (including the sort query params) and returns the parsed characters', async () => {
		const mockCharacters = [{ id: 1, name: 'Bob Belcher' }];
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			json: async () => mockCharacters,
		});

		const result = await getCharacters();

		expect(global.fetch).toHaveBeenCalledWith(
			'https://bobsburgers-api.herokuapp.com/characters?sortBy=name&OrderBy=asc',
		);
		expect(result).toEqual(mockCharacters);
	});

	it('returns an empty array when the fetch fails', async () => {
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error('network down'),
		);

		const result = await getCharacters();

		expect(result).toEqual([]);
	});
});
