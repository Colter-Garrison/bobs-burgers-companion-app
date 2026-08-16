import { act, renderHook, waitFor } from '@testing-library/react-native';
import { useSearchableItems } from './useSearchableItems';
import { getBurgersOfTheDay } from './fetchBurgersOfTheDay';
import { getCharacters } from './fetchCharacters';
import { getEndCreditsSequences } from './fetchEndCreditsSequences';
import { getEpisodes } from './fetchEpisodes';
import { getPestControlTrucks } from './fetchPestControlTrucks';
import { getStoresNextDoor } from './fetchStoresNextDoor';

// jest.mock() (with no factory) replaces the entire module with an
// auto-mocked version — every exported function becomes a jest.fn() we
// control per-test below, instead of the real fetch-based implementation
// running (which would make 6 real network calls per test otherwise).
jest.mock('./fetchBurgersOfTheDay');
jest.mock('./fetchCharacters');
jest.mock('./fetchEndCreditsSequences');
jest.mock('./fetchEpisodes');
jest.mock('./fetchPestControlTrucks');
jest.mock('./fetchStoresNextDoor');

describe('useSearchableItems', () => {
	beforeEach(() => {
		(getBurgersOfTheDay as jest.Mock).mockResolvedValue([
			{ id: 1, name: 'Burger A', episodeUrl: 'https://a' },
		]);
		(getCharacters as jest.Mock).mockResolvedValue([
			{ id: 2, name: 'Bob', image: 'https://img', wikiUrl: 'https://wiki' },
		]);
		(getEndCreditsSequences as jest.Mock).mockResolvedValue([
			{
				id: 3,
				image: 'https://img2',
				season: 1,
				episode: 2,
				episodeUrl: 'https://ec',
			},
		]);
		(getEpisodes as jest.Mock).mockResolvedValue([]);
		(getPestControlTrucks as jest.Mock).mockResolvedValue([]);
		(getStoresNextDoor as jest.Mock).mockResolvedValue([]);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('starts loading, then normalizes and id-prefixes items from every source', async () => {
		const { result } = renderHook(() => useSearchableItems());

		expect(result.current.loading).toBe(true);

		// waitFor polls the callback until it stops throwing (or times
		// out) — the standard way to wait for state that updates
		// asynchronously after a promise resolves, without needing a real
		// or fake timer here (nothing in this hook uses setTimeout).
		await waitFor(() => expect(result.current.loading).toBe(false));

		expect(result.current.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({
					id: 'burger-1',
					category: 'Burgers of the Day',
					label: 'Burger A',
				}),
				expect.objectContaining({
					id: 'character-2',
					category: 'Characters',
					label: 'Bob',
				}),
				// The end-credits API has no `name` field, so the hook
				// synthesizes a label from season/episode instead.
				expect.objectContaining({
					id: 'endCredits-3',
					category: 'End Credits',
					label: 'Season 1, Episode 2',
				}),
			]),
		);
	});

	it("keeps the other five sources' results and surfaces an error when one source rejects", async () => {
		(getCharacters as jest.Mock).mockRejectedValue(new Error('boom'));

		const { result } = renderHook(() => useSearchableItems());
		await waitFor(() => expect(result.current.loading).toBe(false));

		// Promise.allSettled doesn't let one rejected source discard the
		// others — burgers and end credits (both mocked to succeed above)
		// still show up, even though characters failed.
		expect(result.current.items).toEqual(
			expect.arrayContaining([
				expect.objectContaining({ id: 'burger-1' }),
				expect.objectContaining({ id: 'endCredits-3' }),
			]),
		);
		expect(
			result.current.items.some((item) => item.id.startsWith('character-')),
		).toBe(false);
		expect(result.current.error).toBe('Some results may be missing.');
	});

	it('retry re-runs every source and can clear a prior error', async () => {
		(getCharacters as jest.Mock).mockRejectedValueOnce(new Error('boom'));

		const { result } = renderHook(() => useSearchableItems());
		await waitFor(() => expect(result.current.loading).toBe(false));
		expect(result.current.error).toBe('Some results may be missing.');

		await act(async () => {
			await result.current.retry();
		});

		expect(result.current.error).toBeNull();
		expect(result.current.items).toEqual(
			expect.arrayContaining([expect.objectContaining({ id: 'character-2' })]),
		);
	});
});
