export type FavoriteCategory =
	| 'burger'
	| 'character'
	| 'end_credit'
	| 'episode'
	| 'pest_control_truck'
	| 'store'

export interface Favorite {
	category: FavoriteCategory
	itemId: number
	createdAt: string
}
