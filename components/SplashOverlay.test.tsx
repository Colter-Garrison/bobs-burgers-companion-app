import { act, render, screen } from '@testing-library/react-native'
import { MIN_DISPLAY_MS, SplashOverlay } from './SplashOverlay'
import { useTheme } from '../hooks/useTheme'

jest.mock('../hooks/useTheme')

describe('SplashOverlay', () => {
	beforeEach(() => {
		jest.useFakeTimers()
	})

	afterEach(() => {
		jest.useRealTimers()
		jest.clearAllMocks()
	})

	it('covers the screen while the theme is not yet ready', () => {
		;(useTheme as jest.Mock).mockReturnValue({ isThemeReady: false })

		render(<SplashOverlay />)

		expect(screen.getByTestId('splash-overlay')).toBeVisible()
	})

	it('stays up for the full minimum display time even if the theme resolves immediately, then disappears outright', () => {
		;(useTheme as jest.Mock).mockReturnValue({ isThemeReady: true })

		render(<SplashOverlay />)

		act(() => {
			jest.advanceTimersByTime(MIN_DISPLAY_MS - 1)
		})
		expect(screen.getByTestId('splash-overlay')).toBeVisible()

		act(() => {
			jest.advanceTimersByTime(1)
		})
		expect(screen.queryByTestId('splash-overlay')).toBeNull()
	})

	it('waits out only the remaining time when the theme becomes ready partway through the minimum display window', () => {
		;(useTheme as jest.Mock).mockReturnValue({ isThemeReady: false })

		const { rerender } = render(<SplashOverlay />)

		act(() => {
			jest.advanceTimersByTime(MIN_DISPLAY_MS - 500)
		})

		;(useTheme as jest.Mock).mockReturnValue({ isThemeReady: true })
		rerender(<SplashOverlay />)

		act(() => {
			jest.advanceTimersByTime(499)
		})
		expect(screen.getByTestId('splash-overlay')).toBeVisible()

		act(() => {
			jest.advanceTimersByTime(1)
		})
		expect(screen.queryByTestId('splash-overlay')).toBeNull()
	})
})
