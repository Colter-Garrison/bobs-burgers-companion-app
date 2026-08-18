import { fireEvent, render, screen } from '@testing-library/react-native';
import { SearchResultCard } from './SearchResultCard';
import { SearchItem } from '../hooks/useSearchableItems';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../hooks/useTheme';
import { useRouter } from 'expo-router';

jest.mock('../hooks/useAuth');
jest.mock('../hooks/useTheme');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

const item: SearchItem = {
	id: 'character-1',
	category: 'Characters',
	label: 'Bob Belcher',
	image: 'https://img',
	itemId: 1,
	favoriteCategory: 'character',
};

describe('SearchResultCard', () => {
	const mockOnToggleFavorite = jest.fn();
	const mockOnPress = jest.fn();

	beforeEach(() => {
		(useAuth as jest.Mock).mockReturnValue({ token: 'token-abc' });
		(useTheme as jest.Mock).mockReturnValue({ isDark: false });
		(useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('shows the category and label', () => {
		render(
			<SearchResultCard
				item={item}
				favorited={false}
				onToggleFavorite={mockOnToggleFavorite}
				onPress={mockOnPress}
			/>,
		);

		expect(screen.getByText('Characters')).toBeVisible();
		expect(screen.getByText('Bob Belcher')).toBeVisible();
	});

	it('calls onPress when the card body is tapped', () => {
		render(
			<SearchResultCard
				item={item}
				favorited={false}
				onToggleFavorite={mockOnToggleFavorite}
				onPress={mockOnPress}
			/>,
		);

		fireEvent.press(screen.getByText('Bob Belcher'));
		expect(mockOnPress).toHaveBeenCalled();
	});

	it('calls onToggleFavorite, not onPress, when the favorite button is tapped', () => {
		render(
			<SearchResultCard
				item={item}
				favorited={false}
				onToggleFavorite={mockOnToggleFavorite}
				onPress={mockOnPress}
			/>,
		);

		fireEvent.press(screen.getByLabelText('Add Bob Belcher to favorites'));
		expect(mockOnToggleFavorite).toHaveBeenCalled();
		expect(mockOnPress).not.toHaveBeenCalled();
	});

	it('reflects the favorited state on the favorite button', () => {
		render(
			<SearchResultCard
				item={item}
				favorited={true}
				onToggleFavorite={mockOnToggleFavorite}
				onPress={mockOnPress}
			/>,
		);

		expect(
			screen.getByLabelText('Remove Bob Belcher from favorites'),
		).toBeVisible();
	});
});
