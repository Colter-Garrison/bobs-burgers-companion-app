import { render, screen } from '@testing-library/react-native';
import { useLocalSearchParams } from 'expo-router';
import DetailScreen from './[id]';
import { useCategoryItem } from '../../../hooks/useCategoryItem';
import { useTheme } from '../../../hooks/useTheme';
import { LIGHT_THEME_COLORS } from '../../../jest/themeColorsFixture';

jest.mock('../../../hooks/useCategoryItem');
jest.mock('../../../hooks/useTheme');
jest.mock('expo-router', () => ({
	useLocalSearchParams: jest.fn(),
}));
jest.mock('expo-router/drawer', () => ({
	Drawer: { Screen: () => null },
}));

beforeEach(() => {
	(useTheme as jest.Mock).mockReturnValue({
		isDark: false,
		toggleTheme: jest.fn(),
		colors: LIGHT_THEME_COLORS,
	});
});

const character = {
	id: 5,
	name: 'Bob Belcher',
	relatives: [],
	wikiUrl: 'https://wiki/bob',
	image: 'https://img/bob',
	gender: 'Male',
	hair: 'Black',
	age: null,
	nicknames: [],
	occupation: "Owner of Bob's Burgers",
	allOccupations: [],
	firstEpisode: '',
	voicedBy: '',
	url: '',
};

const episode = {
	id: 10,
	name: 'Human Flesh',
	description: 'A pilot episode.',
	productionCode: '',
	airDate: '',
	season: 1,
	episode: 1,
	totalViewers: '',
	url: '',
	wikiUrl: 'https://wiki/human-flesh',
};

const burger = {
	id: 7,
	name: 'Test Burger',
	price: '$5.00',
	season: 1,
	episode: 1,
	episodeUrl: 'https://bobsburgers-api.herokuapp.com/episodes/10',
	url: '',
};

const endCredit = {
	id: 8,
	image: 'https://img/ec',
	season: 1,
	episode: 1,
	episodeUrl: 'https://bobsburgers-api.herokuapp.com/episodes/10',
	url: '',
};

const truck = {
	id: 9,
	name: 'Test Truck',
	image: 'https://img/truck',
	season: 1,
	episode: 1,
	episodeUrl: 'https://bobsburgers-api.herokuapp.com/episodes/10',
	url: '',
};

const store = {
	id: 11,
	name: 'Test Store',
	image: 'https://img/store',
	season: 1,
	episode: 1,
	episodeUrl: 'https://bobsburgers-api.herokuapp.com/episodes/10',
	url: '',
};

function mockDataByCacheKey(entries: Record<string, unknown>) {
	(useCategoryItem as jest.Mock).mockImplementation(
		(_fetchFn: unknown, cacheKey: string) => ({
			data: cacheKey in entries ? entries[cacheKey] : null,
			loading: false,
			error: null,
			retry: jest.fn(),
			cachedAt: null,
		}),
	);
}

describe('DetailScreen', () => {
	afterEach(() => {
		jest.clearAllMocks();
	});

	it('characters: shows the name, full bio, and its own wiki link', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			category: 'characters',
			id: '5',
		});
		mockDataByCacheKey({ 'character-detail-5': character });

		render(<DetailScreen />);

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.getByText(/Owner of Bob's Burgers/)).toBeVisible();
		expect(screen.getByText('View on Fandom')).toBeVisible();
	});

	it('episodes: shows the name, full bio, and its own wiki link', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			category: 'episodes',
			id: '10',
		});
		mockDataByCacheKey({ 'episode-detail-10': episode });

		render(<DetailScreen />);

		expect(screen.getByText('Human Flesh')).toBeVisible();
		expect(screen.getByText(/A pilot episode\./)).toBeVisible();
		expect(screen.getByText('View on Fandom')).toBeVisible();
	});

	it("burgers: shows the name, mentions the resolved episode's name, and links to that episode's wiki page", () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			category: 'burgers',
			id: '7',
		});
		mockDataByCacheKey({
			'burger-detail-7': burger,
			'episode-detail-10': episode,
		});

		render(<DetailScreen />);

		expect(screen.getByText('Test Burger')).toBeVisible();
		expect(screen.getByText(/\("Human Flesh"\)/)).toBeVisible();
		expect(screen.getByText('View on Fandom')).toBeVisible();
	});

	it('end credits: shows a season/episode-based name and mentions the resolved episode', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			category: 'endCredits',
			id: '8',
		});
		mockDataByCacheKey({
			'endCredit-detail-8': endCredit,
			'episode-detail-10': episode,
		});

		render(<DetailScreen />);

		expect(screen.getByText('End Credits — Season 1, Episode 1')).toBeVisible();
		expect(screen.getByText(/\("Human Flesh"\)/)).toBeVisible();
	});

	it('pest control trucks: shows the name and mentions the resolved episode', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			category: 'pestControl',
			id: '9',
		});
		mockDataByCacheKey({
			'truck-detail-9': truck,
			'episode-detail-10': episode,
		});

		render(<DetailScreen />);

		expect(screen.getByText('Test Truck')).toBeVisible();
		expect(screen.getByText(/\("Human Flesh"\)/)).toBeVisible();
	});

	it('stores: shows the name and mentions the resolved episode', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			category: 'stores',
			id: '11',
		});
		mockDataByCacheKey({
			'store-detail-11': store,
			'episode-detail-10': episode,
		});

		render(<DetailScreen />);

		expect(screen.getByText('Test Store')).toBeVisible();
		expect(screen.getByText(/\("Human Flesh"\)/)).toBeVisible();
	});

	it('shows a loading skeleton while the primary item has not resolved yet', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			category: 'characters',
			id: '5',
		});
		(useCategoryItem as jest.Mock).mockReturnValue({
			data: null,
			loading: true,
			error: null,
			retry: jest.fn(),
			cachedAt: null,
		});

		render(<DetailScreen />);

		expect(screen.getByTestId('category-skeleton')).toBeVisible();
	});

	it('shows an error state for an unrecognized category', () => {
		(useLocalSearchParams as jest.Mock).mockReturnValue({
			category: 'not-a-real-category',
			id: '1',
		});
		mockDataByCacheKey({});

		render(<DetailScreen />);

		expect(screen.getByText('Unknown category.')).toBeVisible();
	});
});
