import type { Href } from 'expo-router'
import { SearchCategory } from '../hooks/useSearchableItems'

export const CATEGORY_SLUGS: Record<SearchCategory, string> = {
	'Burgers of the Day': 'burgers',
	Characters: 'characters',
	'End Credits': 'endCredits',
	Episodes: 'episodes',
	'Pest Control Trucks': 'pestControl',
	'Stores Next Door': 'stores',
}

export function detailHref(category: SearchCategory, itemId: number): Href {
	return {
		pathname: '/detail/[category]/[id]',
		params: { category: CATEGORY_SLUGS[category], id: String(itemId) },
	}
}
