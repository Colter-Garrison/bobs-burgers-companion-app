import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { usePathname, useRouter } from 'expo-router'
import { DrawerContentComponentProps } from 'expo-router/drawer'
import { DrawerContent } from './DrawerContent'
import { useTheme } from '../hooks/useTheme'
import {
	DARK_THEME_COLORS,
	LIGHT_THEME_COLORS,
} from '../jest/themeColorsFixture'

jest.mock('../hooks/useTheme')
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
	usePathname: jest.fn(),
}))
jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))
jest.mock('expo-router/drawer', () => {
	const { Pressable, Text, View } = jest.requireActual('react-native')
	return {
		DrawerContentScrollView: ({ children }: { children: React.ReactNode }) => (
			<View>{children}</View>
		),
		DrawerItemList: () => <Text>DrawerItemList</Text>,
		DrawerItem: ({
			label,
			onPress,
		}: {
			label: string
			onPress: () => void
		}) => (
			<Pressable onPress={onPress} accessibilityRole='button'>
				<Text>{label}</Text>
			</Pressable>
		),
	}
})

const fakeDrawerProps = {} as unknown as DrawerContentComponentProps

describe('DrawerContent', () => {
	const mockPush = jest.fn()

	const mockToggleTheme = jest.fn()
	const mockSetColorblindMode = jest.fn()

	beforeEach(() => {
		;(useRouter as jest.Mock).mockReturnValue({ push: mockPush })
		;(usePathname as jest.Mock).mockReturnValue('/')
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: mockToggleTheme,
			colors: LIGHT_THEME_COLORS,
			colorblindMode: 'none',
			setColorblindMode: mockSetColorblindMode,
		})
	})

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('shows Favorites and About the Dev below the categories, with no account links', () => {
		render(<DrawerContent {...fakeDrawerProps} />)

		expect(screen.queryByText('Log In')).toBeNull()
		expect(screen.queryByText(/^Hello, /)).toBeNull()
		expect(screen.queryByText('Log Out')).toBeNull()
		expect(screen.queryByText(/Buy me a/)).toBeNull()

		fireEvent.press(screen.getByText('Favorites'))
		expect(mockPush).toHaveBeenCalledWith('/favorites')

		fireEvent.press(screen.getByText('About the Dev'))
		expect(mockPush).toHaveBeenCalledWith('/aboutTheDev')
	})

	it('renders About the Dev after Favorites', () => {
		render(<DrawerContent {...fakeDrawerProps} />)

		const order = screen
			.getAllByText(/Favorites|About the Dev/)
			.map((node) => node.props.children)
		expect(order).toEqual(['Favorites', 'About the Dev'])
	})

	it('shows the sun icon (not the moon) in light mode, and calls toggleTheme when pressed', () => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: mockToggleTheme,
			colors: LIGHT_THEME_COLORS,
			colorblindMode: 'none',
			setColorblindMode: mockSetColorblindMode,
		})

		render(<DrawerContent {...fakeDrawerProps} />)

		expect(screen.getByLabelText('Switch to dark mode')).toBeVisible()
		expect(screen.queryByLabelText('Switch to light mode')).toBeNull()

		fireEvent.press(screen.getByLabelText('Switch to dark mode'))
		expect(mockToggleTheme).toHaveBeenCalled()
	})

	it('shows the moon icon (not the sun) in dark mode', () => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: true,
			toggleTheme: mockToggleTheme,
			colors: DARK_THEME_COLORS,
			colorblindMode: 'none',
			setColorblindMode: mockSetColorblindMode,
		})

		render(<DrawerContent {...fakeDrawerProps} />)

		expect(screen.getByLabelText('Switch to light mode')).toBeVisible()
		expect(screen.queryByLabelText('Switch to dark mode')).toBeNull()
	})

	it('always renders the category link list', () => {
		render(<DrawerContent {...fakeDrawerProps} />)

		expect(screen.getByText('DrawerItemList')).toBeVisible()
	})
})
