import { fireEvent, render, screen } from '@testing-library/react-native';
import { ErrorState } from './ErrorState';

describe('ErrorState', () => {
	it('shows a default message and calls onRetry when pressed', () => {
		const mockOnRetry = jest.fn();
		render(<ErrorState onRetry={mockOnRetry} />);

		expect(screen.getByText('Something went wrong.')).toBeVisible();

		fireEvent.press(screen.getByRole('button', { name: 'Retry' }));
		expect(mockOnRetry).toHaveBeenCalled();
	});

	it('shows a custom message when provided', () => {
		render(
			<ErrorState
				message='Request timed out. Please try again.'
				onRetry={jest.fn()}
			/>,
		);

		expect(
			screen.getByText('Request timed out. Please try again.'),
		).toBeVisible();
	});
});
