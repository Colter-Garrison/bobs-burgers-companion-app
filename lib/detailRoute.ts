import type { Href } from 'expo-router';
import { SearchCategory } from '../hooks/useSearchableItems';

// The single source of truth mapping a SearchCategory to the slug
// app/detail/[category]/[id].tsx's own switch statement expects — kept
// identical to the six category screens' own route names
// (app/(drawer)/(categories)/*.tsx) purely for consistency, not because
// anything requires it.
export const CATEGORY_SLUGS: Record<SearchCategory, string> = {
	'Burgers of the Day': 'burgers',
	Characters: 'characters',
	'End Credits': 'endCredits',
	Episodes: 'episodes',
	'Pest Control Trucks': 'pestControl',
	'Stores Next Door': 'stores',
};

// Used by components/SearchResultCard.tsx (Home search + Favorites),
// which only has a generic SearchItem to work from. The six category
// screens each already know their own category, so they build this
// same shape inline with a literal slug instead of going through this.
export function detailHref(category: SearchCategory, itemId: number): Href {
	return {
		pathname: '/detail/[category]/[id]',
		params: { category: CATEGORY_SLUGS[category], id: String(itemId) },
	};
}
