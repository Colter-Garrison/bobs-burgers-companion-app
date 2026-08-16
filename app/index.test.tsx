import { fireEvent, render, screen } from '@testing-library/react-native';
import Index from './index';
import { useSearchableItems } from '../hooks/useSearchableItems';

jest.mock('../hooks/useSearchableItems');

describe('Home / search screen', () => {
	beforeEach(() => {
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
});
