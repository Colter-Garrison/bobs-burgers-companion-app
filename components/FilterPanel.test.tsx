import { fireEvent, render, screen } from '@testing-library/react-native';
import { FilterPanel } from './FilterPanel';

describe('FilterPanel', () => {
	const mockOnSelectCategory = jest.fn();
	const mockOnToggleGender = jest.fn();
	const mockOnToggleHair = jest.fn();
	const mockOnToggleSort = jest.fn();

	const baseProps = {
		categoryFilter: 'All' as const,
		onSelectCategory: mockOnSelectCategory,
		genders: new Set<'Male' | 'Female'>(),
		hairColors: new Set<
			'Blonde' | 'Brown' | 'Black' | 'Red' | 'Gray' | 'Bald' | 'Other'
		>(),
		sortDirection: null,
		onToggleGender: mockOnToggleGender,
		onToggleHair: mockOnToggleHair,
		onToggleSort: mockOnToggleSort,
		activeCount: 0,
	};

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('starts collapsed, showing only the "Filter By" toggle', () => {
		render(<FilterPanel {...baseProps} />);

		expect(screen.getByLabelText('Show filter options')).toBeVisible();
		expect(screen.queryByTestId('filter-panel-options')).toBeNull();
	});

	it('expands to show category, gender, hair, and sort options when tapped', () => {
		render(<FilterPanel {...baseProps} />);

		fireEvent.press(screen.getByLabelText('Show filter options'));

		expect(screen.getByTestId('filter-panel-options')).toBeVisible();
		expect(screen.getByLabelText('Filter by Characters')).toBeVisible();
		expect(screen.getByLabelText('Filter by gender: Male')).toBeVisible();
		expect(screen.getByLabelText('Filter by gender: Female')).toBeVisible();
		expect(screen.getByLabelText('Filter by hair color: Blonde')).toBeVisible();
		expect(screen.getByLabelText('Tap to sort A to Z')).toBeVisible();
	});

	it('collapses again on a second tap', () => {
		render(<FilterPanel {...baseProps} />);

		fireEvent.press(screen.getByLabelText('Show filter options'));
		expect(screen.getByTestId('filter-panel-options')).toBeVisible();

		fireEvent.press(screen.getByLabelText('Hide filter options'));
		expect(screen.queryByTestId('filter-panel-options')).toBeNull();
	});

	it('calls onSelectCategory/onToggleGender/onToggleHair/onToggleSort with the right option', () => {
		render(<FilterPanel {...baseProps} />);
		fireEvent.press(screen.getByLabelText('Show filter options'));

		fireEvent.press(screen.getByLabelText('Filter by Characters'));
		expect(mockOnSelectCategory).toHaveBeenCalledWith('Characters');

		fireEvent.press(screen.getByLabelText('Filter by gender: Male'));
		expect(mockOnToggleGender).toHaveBeenCalledWith('Male');

		fireEvent.press(screen.getByLabelText('Filter by hair color: Red'));
		expect(mockOnToggleHair).toHaveBeenCalledWith('Red');

		fireEvent.press(screen.getByLabelText('Tap to sort A to Z'));
		expect(mockOnToggleSort).toHaveBeenCalled();
	});

	it('shows the active filter count on the "Filter By" pill', () => {
		render(<FilterPanel {...baseProps} activeCount={2} />);

		expect(screen.getByText('Filter By (2)')).toBeVisible();
	});

	it('counts a non-"All" category toward the "Filter By" badge', () => {
		render(<FilterPanel {...baseProps} categoryFilter='Characters' />);

		expect(screen.getByText('Filter By (1)')).toBeVisible();
	});

	it('reflects the current sort direction in the sort pill label and icon', () => {
		const { rerender } = render(
			<FilterPanel {...baseProps} sortDirection='asc' />,
		);
		fireEvent.press(screen.getByLabelText('Show filter options'));

		fireEvent.press(screen.getByLabelText('Sorted A to Z. Tap to sort Z to A'));
		expect(mockOnToggleSort).toHaveBeenCalled();

		// rerender keeps the same component instance mounted, so the
		// panel is still expanded from the press above — no need to
		// press "Show filter options" again.
		rerender(<FilterPanel {...baseProps} sortDirection='desc' />);
		expect(
			screen.getByLabelText('Sorted Z to A. Tap to sort A to Z'),
		).toBeVisible();
	});

	it('marks selected gender/hair pills via accessibilityState', () => {
		render(
			<FilterPanel
				{...baseProps}
				genders={new Set(['Male'])}
				hairColors={new Set(['Red'])}
			/>,
		);
		fireEvent.press(screen.getByLabelText('Show filter options'));

		expect(
			screen.getByLabelText('Filter by gender: Male').props.accessibilityState,
		).toEqual({ selected: true });
		expect(
			screen.getByLabelText('Filter by gender: Female').props
				.accessibilityState,
		).toEqual({ selected: false });
		expect(
			screen.getByLabelText('Filter by hair color: Red').props
				.accessibilityState,
		).toEqual({ selected: true });
	});
});
