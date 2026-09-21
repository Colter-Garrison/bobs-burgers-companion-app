import { renderHook } from '@testing-library/react-native'
import { useIsClient } from './useIsClient'

// The server side (false during the static export and hydration) is covered
// against real pre-built HTML by e2e/hydration.spec.ts.
describe('useIsClient', () => {
	it('is true in a normal client render', () => {
		const { result } = renderHook(() => useIsClient())
		expect(result.current).toBe(true)
	})
})
