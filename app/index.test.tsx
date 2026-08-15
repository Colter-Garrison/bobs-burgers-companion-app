import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import Index from './index';
import { useSearchableItems } from '../hooks/useSearchableItems';

jest.mock('../hooks/useSearchableItems');
// expo-router isn't wired up to a real navigator in a bare RNTL render,
// so useRouter needs mocking too, the same way useSearchableItems does.
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));

describe('Home / search screen', () => {
	const mockPush = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
		(useSearchableItems as jest.Mock).mockReturnValue({
			loading: false,
			items: [
				{
					id: 'burger-1',
					category: 'Burgers of the Day',
					label: 'Test Burger',
				},
				{ id: 'character-2', category: 'Characters', label: 'Bob Belcher' },
			],
		});
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('shows nothing search-related until the user types', () => {
		render(<Index />);
		expect(screen.queryByText('No results found.')).toBeNull();
		expect(screen.queryByText('Test Burger')).toBeNull();
	});

	it('live-filters as the user types, case-insensitively, on partial matches', () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'bob');

		expect(screen.getByText('Bob Belcher')).toBeVisible();
		expect(screen.queryByText('Test Burger')).toBeNull();
	});

	it('shows "No results found." for a query matching nothing', () => {
		render(<Index />);
		const input = screen.getByPlaceholderText(
			'Search burgers, characters, episodes...',
		);

		fireEvent.changeText(input, 'zzzznomatch');

		expect(screen.getByText('No results found.')).toBeVisible();
	});

	it('each of the 6 nav buttons pushes the correct route', () => {
		render(<Index />);

		fireEvent.press(screen.getByText('Burgers of the Day'));
		expect(mockPush).toHaveBeenCalledWith('/burgers');

		fireEvent.press(screen.getByText('Characters'));
		expect(mockPush).toHaveBeenCalledWith('/characters');

		fireEvent.press(screen.getByText('End Credits'));
		expect(mockPush).toHaveBeenCalledWith('/endCredits');

		fireEvent.press(screen.getByText('Episodes'));
		expect(mockPush).toHaveBeenCalledWith('/episodes');

		fireEvent.press(screen.getByText('Pest Control Trucks'));
		expect(mockPush).toHaveBeenCalledWith('/pestControl');

		fireEvent.press(screen.getByText('Stores Next Door'));
		expect(mockPush).toHaveBeenCalledWith('/stores');
	});
});
