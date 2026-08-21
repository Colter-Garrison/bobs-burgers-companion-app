import { fireEvent, render, screen } from '@testing-library/react-native'
import { LoadMoreButton } from './LoadMoreButton'

describe('LoadMoreButton', () => {
	it('calls onPress when tapped', () => {
		const onPress = jest.fn()
		render(<LoadMoreButton onPress={onPress} />)

		fireEvent.press(screen.getByRole('button'))

		expect(onPress).toHaveBeenCalled()
	})
})
