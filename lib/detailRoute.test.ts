import { detailHref } from './detailRoute'

describe('detailHref', () => {
	it('maps each SearchCategory to its matching detail route slug', () => {
		expect(detailHref('Burgers of the Day', 5)).toEqual({
			pathname: '/detail/[category]/[id]',
			params: { category: 'burgers', id: '5' },
		})
		expect(detailHref('Characters', 5)).toEqual({
			pathname: '/detail/[category]/[id]',
			params: { category: 'characters', id: '5' },
		})
		expect(detailHref('End Credits', 5)).toEqual({
			pathname: '/detail/[category]/[id]',
			params: { category: 'endCredits', id: '5' },
		})
		expect(detailHref('Episodes', 5)).toEqual({
			pathname: '/detail/[category]/[id]',
			params: { category: 'episodes', id: '5' },
		})
		expect(detailHref('Pest Control Trucks', 5)).toEqual({
			pathname: '/detail/[category]/[id]',
			params: { category: 'pestControl', id: '5' },
		})
		expect(detailHref('Stores Next Door', 5)).toEqual({
			pathname: '/detail/[category]/[id]',
			params: { category: 'stores', id: '5' },
		})
	})
})
