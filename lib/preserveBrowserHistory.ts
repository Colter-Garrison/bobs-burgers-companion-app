import { Platform } from 'react-native'

export function preserveBrowserHistory() {
	if (Platform.OS !== 'web' || typeof window === 'undefined') {
		return
	}

	const originalPush = window.history.pushState.bind(window.history)
	const originalReplace = window.history.replaceState.bind(window.history)
	const originalGo = window.history.go.bind(window.history)

	window.history.replaceState = (
		state: unknown,
		title: string,
		url?: string | URL | null,
	) => {
		if (url != null) {
			const nextPathname = new URL(url, window.location.href).pathname
			if (nextPathname !== window.location.pathname) {
				return originalPush(state, title, url)
			}
		}
		return originalReplace(state, title, url)
	}

	window.history.go = (delta?: number) => {
		if (typeof delta === 'number' && delta < 0) {
			return
		}
		return originalGo(delta)
	}
}
