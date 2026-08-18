import { render, screen } from '@testing-library/react-native';
import { CategorySkeleton } from './CategorySkeleton';
import { useTheme } from '../hooks/useTheme';

jest.mock('../hooks/useTheme');

describe('CategorySkeleton', () => {
	beforeEach(() => {
		(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: jest.fn(),
		});
	});

	it('renders the default number of placeholder cards', () => {
		render(<CategorySkeleton />);

		expect(screen.getByTestId('category-skeleton').children).toHaveLength(4);
	});

	it('renders a custom number of placeholder cards', () => {
		render(<CategorySkeleton count={2} />);

		expect(screen.getByTestId('category-skeleton').children).toHaveLength(2);
	});

	it('still renders its placeholder cards in the non-full-screen variant', () => {
		render(<CategorySkeleton count={3} fullScreen={false} />);

		expect(screen.getByTestId('category-skeleton').children).toHaveLength(3);
	});
});
