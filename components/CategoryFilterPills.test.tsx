import { fireEvent, render, screen } from '@testing-library/react-native';
import { CategoryFilterPills } from './CategoryFilterPills';

describe('CategoryFilterPills', () => {
	const mockOnSelect = jest.fn();

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('renders "All" plus all six category pills', () => {
		render(<CategoryFilterPills selected='All' onSelect={mockOnSelect} />);

		expect(screen.getByLabelText('Filter by All')).toBeVisible();
		expect(screen.getByLabelText('Filter by Burgers of the Day')).toBeVisible();
		expect(screen.getByLabelText('Filter by Characters')).toBeVisible();
		expect(screen.getByLabelText('Filter by End Credits')).toBeVisible();
		expect(screen.getByLabelText('Filter by Episodes')).toBeVisible();
		expect(
			screen.getByLabelText('Filter by Pest Control Trucks'),
		).toBeVisible();
		expect(screen.getByLabelText('Filter by Stores Next Door')).toBeVisible();
	});

	it('marks the selected pill via accessibilityState', () => {
		render(
			<CategoryFilterPills selected='Characters' onSelect={mockOnSelect} />,
		);

		expect(
			screen.getByLabelText('Filter by Characters').props.accessibilityState,
		).toEqual({ selected: true });
		expect(
			screen.getByLabelText('Filter by All').props.accessibilityState,
		).toEqual({ selected: false });
	});

	it('calls onSelect with the tapped category', () => {
		render(<CategoryFilterPills selected='All' onSelect={mockOnSelect} />);

		fireEvent.press(screen.getByLabelText('Filter by Episodes'));

		expect(mockOnSelect).toHaveBeenCalledWith('Episodes');
	});
});
