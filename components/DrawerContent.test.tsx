import React from 'react'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { usePathname } from 'expo-router'
import { DrawerContentComponentProps } from 'expo-router/drawer'
import { DrawerContent } from './DrawerContent'
import { useTheme } from '../hooks/useTheme'
import {
	DARK_THEME_COLORS,
	LIGHT_THEME_COLORS,
} from '../jest/themeColorsFixture'

jest.mock('../hooks/useTheme')
// Link hands its href and onPress to its child (asChild), so the mock
// does the same — tests read the href straight off the rendered link.
jest.mock('expo-router', () => {
	const { cloneElement } = jest.requireActual('react')
	return {
		usePathname: jest.fn(),
		Link: ({
			href,
			onPress,
			children,
		}: {
			href: string
			onPress?: () => void
			children: React.ReactElement
		}) => cloneElement(children, { href, onPress }),
	}
})
jest.mock('expo-router/react-navigation', () => ({
	DrawerActions: { closeDrawer: () => ({ type: 'CLOSE_DRAWER' }) },
	useLinkBuilder: () => ({
		buildHref: (name: string) =>
			'/' + name.replace(/^\(.*?\)\//, '').replace(/^index$/, ''),
	}),
}))
jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}))
jest.mock('expo-router/drawer', () => {
	const { View } = jest.requireActual('react-native')
	return {
		DrawerContentScrollView: ({ children }: { children: React.ReactNode }) => (
			<View>{children}</View>
		),
	}
})

const hidden = { drawerItemStyle: { display: 'none' as const } }

const routes = [
	{ key: 'home', name: 'index', options: { title: 'Home' } },
	{
		key: 'characters',
		name: '(categories)/characters',
		options: { title: 'Characters' },
	},
	{
		key: 'favorites',
		name: 'favorites',
		options: { title: 'My Favorites', drawerLabel: 'Favorites' },
	},
	{ key: 'about', name: 'aboutTheDev', options: { title: 'About the Dev' } },
	{
		key: 'detail',
		name: 'detail/[category]/[id]',
		options: { title: 'Details', ...hidden },
	},
]

function drawerProps(focusedIndex: number, dispatch = jest.fn()) {
	return {
		state: {
			index: focusedIndex,
			routes: routes.map(({ key, name }) => ({ key, name })),
		},
		descriptors: Object.fromEntries(
			routes.map(({ key, options }) => [key, { options }]),
		),
		navigation: { dispatch },
	} as unknown as DrawerContentComponentProps
}

describe('DrawerContent', () => {
	const mockToggleTheme = jest.fn()
	const mockSetColorblindMode = jest.fn()

	beforeEach(() => {
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

	it('renders each visible screen as a link, in order, with its URL', () => {
		render(<DrawerContent {...drawerProps(0)} />)

		const links = screen.getAllByRole('link')
		expect(links.map((link) => link.props.href)).toEqual([
			'/',
			'/characters',
			'/favorites',
			'/aboutTheDev',
		])
		expect(screen.getByRole('link', { name: 'Characters' })).toBeVisible()
	})

	it('skips screens hidden from the drawer', () => {
		render(<DrawerContent {...drawerProps(0)} />)

		expect(screen.queryByText('Details')).toBeNull()
	})

	it('uses drawerLabel over title when both are set', () => {
		render(<DrawerContent {...drawerProps(0)} />)

		expect(screen.getByRole('link', { name: 'Favorites' })).toBeVisible()
		expect(screen.queryByText('My Favorites')).toBeNull()
	})

	it('marks only the current screen with aria-current="page"', () => {
		render(<DrawerContent {...drawerProps(1)} />)

		expect(
			screen.getByRole('link', { name: 'Characters' }).props['aria-current'],
		).toBe('page')
		expect(
			screen.getByRole('link', { name: 'Home' }).props['aria-current'],
		).toBeUndefined()
	})

	it('tapping the current screen closes the drawer; other links leave that to navigation', () => {
		const dispatch = jest.fn()
		render(<DrawerContent {...drawerProps(1, dispatch)} />)

		expect(
			screen.getByRole('link', { name: 'Home' }).props.onPress,
		).toBeUndefined()

		fireEvent.press(screen.getByRole('link', { name: 'Characters' }))
		expect(dispatch).toHaveBeenCalledWith({ type: 'CLOSE_DRAWER' })
	})

	it('shows no account links', () => {
		render(<DrawerContent {...drawerProps(0)} />)

		expect(screen.queryByText('Log In')).toBeNull()
		expect(screen.queryByText(/^Hello, /)).toBeNull()
		expect(screen.queryByText('Log Out')).toBeNull()
		expect(screen.queryByText(/Buy me a/)).toBeNull()
	})

	it('shows the sun icon (not the moon) in light mode, and calls toggleTheme when pressed', () => {
		render(<DrawerContent {...drawerProps(0)} />)

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

		render(<DrawerContent {...drawerProps(0)} />)

		expect(screen.getByLabelText('Switch to light mode')).toBeVisible()
		expect(screen.queryByLabelText('Switch to dark mode')).toBeNull()
	})
})
