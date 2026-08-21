import { getEpisodes } from './fetchEpisodes'
import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi'

jest.mock('../lib/bobsBurgersApi')

describe('getEpisodes', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('requests the correct path and returns the result', async () => {
		const mockEpisodes = [
			{ id: 1, name: 'Human Flesh', wikiUrl: 'https://wiki' },
		]
		;(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockEpisodes)

		const result = await getEpisodes()

		expect(fetchBobsBurgersApi).toHaveBeenCalledWith('/episodes/')
		expect(result).toEqual(mockEpisodes)
	})
})
