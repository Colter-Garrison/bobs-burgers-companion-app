import { getCharacters } from './fetchCharacters'
import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi'

jest.mock('../lib/bobsBurgersApi')

describe('getCharacters', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('requests the correct path (including the sort query params) and returns the result', async () => {
		const mockCharacters = [{ id: 1, name: 'Bob Belcher' }]
		;(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockCharacters)

		const result = await getCharacters()

		expect(fetchBobsBurgersApi).toHaveBeenCalledWith(
			'/characters?sortBy=name&OrderBy=asc',
		)
		expect(result).toEqual(mockCharacters)
	})
})
