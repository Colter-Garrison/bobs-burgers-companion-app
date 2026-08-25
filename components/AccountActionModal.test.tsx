import React from 'react'
import { Text } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { AccountActionModal } from './AccountActionModal'

describe('AccountActionModal', () => {
	it('renders nothing when not visible', () => {
		render(
			<AccountActionModal
				visible={false}
				onClose={jest.fn()}
				title='Test Modal'
			>
				<Text>Modal content</Text>
			</AccountActionModal>,
		)

		expect(screen.queryByText('Modal content')).toBeNull()
	})

	it('renders the title and children when visible', () => {
		render(
			<AccountActionModal visible onClose={jest.fn()} title='Test Modal'>
				<Text>Modal content</Text>
			</AccountActionModal>,
		)

		expect(screen.getByText('Test Modal')).toBeVisible()
		expect(screen.getByText('Modal content')).toBeVisible()
	})

	it('calls onClose when the backdrop is pressed', () => {
		const mockOnClose = jest.fn()
		render(
			<AccountActionModal visible onClose={mockOnClose} title='Test Modal'>
				<Text>Modal content</Text>
			</AccountActionModal>,
		)

		fireEvent.press(screen.getByLabelText('Close Test Modal dialog'))

		expect(mockOnClose).toHaveBeenCalled()
	})

	it('does not call onClose when the panel itself is pressed', () => {
		const mockOnClose = jest.fn()
		render(
			<AccountActionModal visible onClose={mockOnClose} title='Test Modal'>
				<Text>Modal content</Text>
			</AccountActionModal>,
		)

		fireEvent.press(screen.getByText('Modal content'))

		expect(mockOnClose).not.toHaveBeenCalled()
	})
})
