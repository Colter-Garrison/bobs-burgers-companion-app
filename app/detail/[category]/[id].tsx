import React from 'react'
import { useLocalSearchParams } from 'expo-router'
import { DetailLayout } from '../../../components/DetailLayout'
import { ErrorState } from '../../../components/ErrorState'
import { useCategoryItem } from '../../../hooks/useCategoryItem'
import { getBurgerOfTheDayById } from '../../../hooks/fetchBurgersOfTheDay'
import { getCharacterById } from '../../../hooks/fetchCharacters'
import { getEndCreditsSequenceById } from '../../../hooks/fetchEndCreditsSequences'
import { getEpisodeById } from '../../../hooks/fetchEpisodes'
import { getPestControlTruckById } from '../../../hooks/fetchPestControlTrucks'
import { getStoreNextDoorById } from '../../../hooks/fetchStoresNextDoor'
import {
	composeBurgerFullBio,
	composeCharacterFullBio,
	composeEndCreditFullBio,
	composeEpisodeFullBio,
	composeStoreFullBio,
	composeTruckFullBio,
	extractEpisodeIdFromUrl,
} from '../../../lib/categoryBio'

function useAssociatedEpisode(episodeUrl: string | undefined) {
	const episodeId = episodeUrl ? extractEpisodeIdFromUrl(episodeUrl) : null
	const { data } = useCategoryItem(
		getEpisodeById,
		`episode-detail-${episodeId}`,
		episodeId,
	)
	return data
}

function BurgerDetail({ id }: { id: number }) {
	const {
		data: burger,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryItem(getBurgerOfTheDayById, `burger-detail-${id}`, id)
	const episode = useAssociatedEpisode(burger?.episodeUrl)

	return (
		<DetailLayout
			loading={loading}
			error={error}
			onRetry={retry}
			cachedAt={cachedAt}
			name={burger?.name ?? ''}
			bio={burger ? composeBurgerFullBio(burger, episode) : ''}
			fandomUrl={episode?.wikiUrl}
		/>
	)
}

function CharacterDetail({ id }: { id: number }) {
	const {
		data: character,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryItem(getCharacterById, `character-detail-${id}`, id)

	return (
		<DetailLayout
			loading={loading}
			error={error}
			onRetry={retry}
			cachedAt={cachedAt}
			name={character?.name ?? ''}
			image={character?.image}
			bio={character ? composeCharacterFullBio(character) : ''}
			fandomUrl={character?.wikiUrl}
		/>
	)
}

function EndCreditDetail({ id }: { id: number }) {
	const {
		data: endCredit,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryItem(getEndCreditsSequenceById, `endCredit-detail-${id}`, id)
	const episode = useAssociatedEpisode(endCredit?.episodeUrl)

	return (
		<DetailLayout
			loading={loading}
			error={error}
			onRetry={retry}
			cachedAt={cachedAt}
			name={
				endCredit
					? `End Credits — Season ${endCredit.season}, Episode ${endCredit.episode}`
					: ''
			}
			image={endCredit?.image}
			bio={endCredit ? composeEndCreditFullBio(endCredit, episode) : ''}
			fandomUrl={episode?.wikiUrl}
		/>
	)
}

function EpisodeDetail({ id }: { id: number }) {
	const {
		data: episode,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryItem(getEpisodeById, `episode-detail-${id}`, id)

	return (
		<DetailLayout
			loading={loading}
			error={error}
			onRetry={retry}
			cachedAt={cachedAt}
			name={episode?.name ?? ''}
			bio={episode ? composeEpisodeFullBio(episode) : ''}
			fandomUrl={episode?.wikiUrl}
		/>
	)
}

function TruckDetail({ id }: { id: number }) {
	const {
		data: truck,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryItem(getPestControlTruckById, `truck-detail-${id}`, id)
	const episode = useAssociatedEpisode(truck?.episodeUrl)

	return (
		<DetailLayout
			loading={loading}
			error={error}
			onRetry={retry}
			cachedAt={cachedAt}
			name={truck?.name ?? ''}
			image={truck?.image}
			bio={truck ? composeTruckFullBio(truck, episode) : ''}
			fandomUrl={episode?.wikiUrl}
		/>
	)
}

function StoreDetail({ id }: { id: number }) {
	const {
		data: store,
		loading,
		error,
		retry,
		cachedAt,
	} = useCategoryItem(getStoreNextDoorById, `store-detail-${id}`, id)
	const episode = useAssociatedEpisode(store?.episodeUrl)

	return (
		<DetailLayout
			loading={loading}
			error={error}
			onRetry={retry}
			cachedAt={cachedAt}
			name={store?.name ?? ''}
			image={store?.image}
			bio={store ? composeStoreFullBio(store, episode) : ''}
			fandomUrl={episode?.wikiUrl}
		/>
	)
}

export default function DetailScreen() {
	const { category, id } = useLocalSearchParams<{
		category: string
		id: string
	}>()
	const numericId = Number(id)

	switch (category?.toLowerCase()) {
		case 'burgers':
			return <BurgerDetail id={numericId} />
		case 'characters':
			return <CharacterDetail id={numericId} />
		case 'endcredits':
			return <EndCreditDetail id={numericId} />
		case 'episodes':
			return <EpisodeDetail id={numericId} />
		case 'pestcontrol':
			return <TruckDetail id={numericId} />
		case 'stores':
			return <StoreDetail id={numericId} />
		default:
			return <ErrorState message='Unknown category.' onRetry={() => {}} />
	}
}
