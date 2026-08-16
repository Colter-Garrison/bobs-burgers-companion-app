import { getEndCreditsSequences } from './fetchEndCreditsSequences';
import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi';

jest.mock('../lib/bobsBurgersApi');

describe('getEndCreditsSequences', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('requests the correct path and returns the result', async () => {
		const mockCredits = [
			{ id: 1, image: 'https://img', season: 1, episode: 1 },
		];
		(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockCredits);

		const result = await getEndCreditsSequences();

		expect(fetchBobsBurgersApi).toHaveBeenCalledWith('/endCreditsSequence/');
		expect(result).toEqual(mockCredits);
	});
});
