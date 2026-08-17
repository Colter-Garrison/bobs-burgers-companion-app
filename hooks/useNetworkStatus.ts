import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';

// isConnected can briefly be null while NetInfo is still determining
// state (e.g. right at app start) — treated as "not known to be
// offline" rather than offline, so a screen doesn't flash an incorrect
// offline banner before the first real reading comes in.
export function useNetworkStatus() {
	const [isOffline, setIsOffline] = useState(false);

	useEffect(() => {
		const unsubscribe = NetInfo.addEventListener((state) => {
			setIsOffline(state.isConnected === false);
		});

		// On web, NetInfo prefers the browser's Network Information API
		// (navigator.connection.onchange) over the standard window
		// 'online'/'offline' events whenever the browser exposes it — true
		// for Chromium, so most real users. That API only reliably fires
		// for connection-*type* changes (e.g. wifi -> cellular), not for
		// actually going offline and back online, so isOffline could get
		// stuck true forever after a real disconnect: nothing ever tells
		// NetInfo the connection came back, and the "offline" banner's own
		// Retry button (which checks isOffline before even attempting a
		// fetch) would stay broken too. Listening to the standard browser
		// events directly, in parallel, is the standard workaround —
		// confirmed these fire correctly where NetInfo's own event doesn't.
		let removeWebListeners: (() => void) | undefined;
		if (Platform.OS === 'web' && typeof window !== 'undefined') {
			const goOnline = () => setIsOffline(false);
			const goOffline = () => setIsOffline(true);
			window.addEventListener('online', goOnline);
			window.addEventListener('offline', goOffline);
			removeWebListeners = () => {
				window.removeEventListener('online', goOnline);
				window.removeEventListener('offline', goOffline);
			};
		}

		return () => {
			unsubscribe();
			removeWebListeners?.();
		};
	}, []);

	return { isOffline };
}
