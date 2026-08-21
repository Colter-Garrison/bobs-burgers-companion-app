import { getBurgersOfTheDay } from './fetchBurgersOfTheDay'
import { fetchBobsBurgersApi } from '../lib/bobsBurgersApi'

jest.mock('../lib/bobsBurgersApi')

describe('getBurgersOfTheDay', () => {
	afterEach(() => {
		jest.clearAllMocks()
	})

	it('requests the correct path and returns the result', async () => {
		const mockBurgers = [{ id: 1, name: 'Test Burger' }]
		;(fetchBobsBurgersApi as jest.Mock).mockResolvedValueOnce(mockBurgers)

		const result = await getBurgersOfTheDay()

		expect(fetchBobsBurgersApi).toHaveBeenCalledWith('/burgerOfTheDay/')
		expect(result).toEqual(mockBurgers)
	})
})
