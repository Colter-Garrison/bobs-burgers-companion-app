import { getEpisodes } from './fetchEpisodes';

describe('getEpisodes', () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('calls the correct URL and returns the parsed episodes', async () => {
		const mockEpisodes = [
			{ id: 1, name: 'Human Flesh', wikiUrl: 'https://wiki' },
		];
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			json: async () => mockEpisodes,
		});

		const result = await getEpisodes();

		expect(global.fetch).toHaveBeenCalledWith(
			'https://bobsburgers-api.herokuapp.com/episodes/',
		);
		expect(result).toEqual(mockEpisodes);
	});

	it('returns an empty array when the fetch fails', async () => {
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error('network down'),
		);

		const result = await getEpisodes();

		expect(result).toEqual([]);
	});
});
