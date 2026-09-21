import React from 'react'
import { SearchResultCard } from 'bobs-burgers-components'

const noop = () => {}

// A character result: photo, category, name and a short bio.
export const Character = () => (
	<SearchResultCard
		item={{
			id: 'character-65',
			category: 'Characters',
			label: 'Bryce',
			image: 'https://bobsburgers-api.herokuapp.com/images/characters/65.jpg',
			itemId: 65,
			favoriteCategory: 'character',
			gender: 'Male',
			hair: 'Ginger',
			bio: 'Bryce is a High school student. First appeared in "Full Bars". Voiced by Joe Lo Truglio.',
		}}
		favorited={false}
		onToggleFavorite={noop}
		onPress={noop}
	/>
)

// Favorited: the hamburger icon turns fully opaque.
export const Favorited = () => (
	<SearchResultCard
		item={{
			id: 'character-1',
			category: 'Characters',
			label: '"Dottie Minerva"',
			image: 'https://bobsburgers-api.herokuapp.com/images/characters/1.jpg',
			itemId: 1,
			favoriteCategory: 'character',
			gender: 'Female',
			hair: 'Blonde',
			bio: '"Dottie Minerva" is a Student at Wagstaff School. First appeared in "The Kids Run the Restaurant". Voiced by Wendy Molyneux.',
		}}
		favorited
		onToggleFavorite={noop}
		onPress={noop}
	/>
)

// Items without an image (Burgers of the Day, Episodes) show text only.
export const TextOnly = () => (
	<SearchResultCard
		item={{
			id: 'episode-1',
			category: 'Episodes',
			label: '"Human Flesh"',
			itemId: 1,
			favoriteCategory: 'episode',
		}}
		favorited={false}
		onToggleFavorite={noop}
		onPress={noop}
	/>
)

// A results list, as on the Home and Favorites screens.
export const ResultsList = () => (
	<div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
		<SearchResultCard
			item={{
				id: 'store-1',
				category: 'Stores Next Door',
				label: 'P.F.E.T.A',
				image:
					'https://bobsburgers-api.herokuapp.com/images/storeNextDoor/1.jpg',
				itemId: 1,
				favoriteCategory: 'store',
			}}
			favorited={false}
			onToggleFavorite={noop}
			onPress={noop}
		/>
		<SearchResultCard
			item={{
				id: 'truck-1',
				category: 'Pest Control Trucks',
				label: "Rat's all Folks! EXTERMINATORS",
				image:
					'https://bobsburgers-api.herokuapp.com/images/pestControlTrucks/1.jpg',
				itemId: 1,
				favoriteCategory: 'pest_control_truck',
			}}
			favorited
			onToggleFavorite={noop}
			onPress={noop}
		/>
	</div>
)
