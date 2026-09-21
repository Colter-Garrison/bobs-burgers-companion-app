import { useSyncExternalStore } from 'react'

const subscribeNever = () => () => {}

// false during the static web export and while the browser hydrates that
// HTML, true on every render after — without a mount effect that sets
// state. Anything that depends on the real URL or browser state should
// wait for it, or the browser's first render won't match the pre-built
// HTML and React throws a hydration error (#418).
export function useIsClient(): boolean {
	return useSyncExternalStore(
		subscribeNever,
		() => true,
		() => false,
	)
}
