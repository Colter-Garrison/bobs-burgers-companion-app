import { getEndCreditsSequences } from './fetchEndCreditsSequences';

describe('getEndCreditsSequences', () => {
	beforeEach(() => {
		global.fetch = jest.fn();
	});

	afterEach(() => {
		jest.restoreAllMocks();
	});

	it('calls the correct URL and returns the parsed end credits sequences', async () => {
		const mockCredits = [
			{ id: 1, image: 'https://img', season: 1, episode: 1 },
		];
		(global.fetch as jest.Mock).mockResolvedValueOnce({
			json: async () => mockCredits,
		});

		const result = await getEndCreditsSequences();

		expect(global.fetch).toHaveBeenCalledWith(
			'https://bobsburgers-api.herokuapp.com/endCreditsSequence/',
		);
		expect(result).toEqual(mockCredits);
	});

	it('returns an empty array when the fetch fails', async () => {
		(global.fetch as jest.Mock).mockRejectedValueOnce(
			new Error('network down'),
		);

		const result = await getEndCreditsSequences();

		expect(result).toEqual([]);
	});
});
