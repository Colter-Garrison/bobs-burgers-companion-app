import { Image, Linking } from 'react-native'
import { fireEvent, render, screen } from '@testing-library/react-native'
import { DetailLayout } from './DetailLayout'
import { useTheme } from '../hooks/useTheme'
import { LIGHT_THEME_COLORS } from '../jest/themeColorsFixture'

jest.mock('expo-router/drawer', () => ({
	Drawer: { Screen: () => null },
}))
jest.mock('../hooks/useTheme')

describe('DetailLayout', () => {
	beforeEach(() => {
		;(useTheme as jest.Mock).mockReturnValue({
			isDark: false,
			toggleTheme: jest.fn(),
			colors: LIGHT_THEME_COLORS,
		})
	})

	const baseProps = {
		loading: false,
		error: null,
		onRetry: jest.fn(),
		cachedAt: null,
		name: 'Bob Belcher',
		bio: 'A great bio.',
	}

	afterEach(() => {
		jest.clearAllMocks()
	})

	it('shows a skeleton while loading, instead of any content', () => {
		render(<DetailLayout {...baseProps} loading />)
		expect(screen.getByTestId('category-skeleton')).toBeVisible()
		expect(screen.queryByText('Bob Belcher')).toBeNull()
	})

	it('shows an error state with a working retry when there is an error', () => {
		const onRetry = jest.fn()
		render(
			<DetailLayout {...baseProps} error='network down' onRetry={onRetry} />,
		)

		expect(screen.getByText('network down')).toBeVisible()
		fireEvent.press(screen.getByRole('button', { name: 'Retry' }))
		expect(onRetry).toHaveBeenCalled()
	})

	it('shows the name and bio once loaded successfully', () => {
		render(<DetailLayout {...baseProps} />)
		expect(screen.getByText('Bob Belcher')).toBeVisible()
		expect(screen.getByText('A great bio.')).toBeVisible()
	})

	it('shows the image when one is provided', () => {
		render(<DetailLayout {...baseProps} image='https://img' />)
		expect(screen.UNSAFE_queryByType(Image)).not.toBeNull()
	})

	it('omits the image entirely when none is provided', () => {
		render(<DetailLayout {...baseProps} />)
		expect(screen.UNSAFE_queryByType(Image)).toBeNull()
	})

	it('shows a "View on Fandom" link that opens the given URL when tapped', () => {
		const openURLSpy = jest
			.spyOn(Linking, 'openURL')
			.mockResolvedValue(true as never)
		render(<DetailLayout {...baseProps} fandomUrl='https://fandom/bob' />)

		fireEvent.press(screen.getByText('View on Fandom'))

		expect(openURLSpy).toHaveBeenCalledWith('https://fandom/bob')
	})

	it('omits the "View on Fandom" link when no URL is given', () => {
		render(<DetailLayout {...baseProps} />)
		expect(screen.queryByText('View on Fandom')).toBeNull()
	})

	it('shows the offline banner when cachedAt is set, alongside the content (not instead of it)', () => {
		render(<DetailLayout {...baseProps} cachedAt={Date.now()} />)
		expect(screen.getByText(/You.re offline/)).toBeVisible()
		expect(screen.getByText('Bob Belcher')).toBeVisible()
	})
})
