import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import NetInfo from '@react-native-community/netinfo'

export function useNetworkStatus() {
	const [isOffline, setIsOffline] = useState(false)

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			setIsOffline(state.isConnected === false)
		})

		let removeWebListeners: (() => void) | undefined
		if (Platform.OS === 'web' && typeof window !== 'undefined') {
			const goOnline = () => setIsOffline(false)
			const goOffline = () => setIsOffline(true)
			window.addEventListener('online', goOnline)
			window.addEventListener('offline', goOffline)
			removeWebListeners = () => {
				window.removeEventListener('online', goOnline)
				window.removeEventListener('offline', goOffline)
			}
		}

		return () => {
			unsubscribe()
			removeWebListeners?.()
		}
	}, [])

	return { isOffline }
}
