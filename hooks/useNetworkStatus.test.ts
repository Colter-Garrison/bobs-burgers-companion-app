import { act, renderHook } from '@testing-library/react-native';
import { Platform } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useNetworkStatus } from './useNetworkStatus';

describe('useNetworkStatus', () => {
	const originalPlatformOS = Platform.OS;

	afterEach(() => {
		jest.clearAllMocks();
		Platform.OS = originalPlatformOS;
	});

	it('starts as not-offline before any NetInfo event has fired', () => {
		const { result } = renderHook(() => useNetworkStatus());
		expect(result.current.isOffline).toBe(false);
	});

	it('reflects offline once NetInfo reports isConnected: false', () => {
		let listener: (state: { isConnected: boolean | null }) => void = () => {};
		(NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
			listener = cb;
			return jest.fn();
		});

		const { result } = renderHook(() => useNetworkStatus());
		act(() => {
			listener({ isConnected: false });
		});

		expect(result.current.isOffline).toBe(true);
	});

	it('treats isConnected: null (still being determined) as not offline', () => {
		let listener: (state: { isConnected: boolean | null }) => void = () => {};
		(NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
			listener = cb;
			return jest.fn();
		});

		const { result } = renderHook(() => useNetworkStatus());
		act(() => {
			listener({ isConnected: null });
		});

		expect(result.current.isOffline).toBe(false);
	});

	it('goes back to online when a later event reports isConnected: true', () => {
		let listener: (state: { isConnected: boolean | null }) => void = () => {};
		(NetInfo.addEventListener as jest.Mock).mockImplementation((cb) => {
			listener = cb;
			return jest.fn();
		});

		const { result } = renderHook(() => useNetworkStatus());
		act(() => {
			listener({ isConnected: false });
		});
		expect(result.current.isOffline).toBe(true);

		act(() => {
			listener({ isConnected: true });
		});
		expect(result.current.isOffline).toBe(false);
	});

	it('unsubscribes from NetInfo on unmount', () => {
		const unsubscribe = jest.fn();
		(NetInfo.addEventListener as jest.Mock).mockReturnValue(unsubscribe);

		const { unmount } = renderHook(() => useNetworkStatus());
		unmount();

		expect(unsubscribe).toHaveBeenCalled();
	});

	describe('on web', () => {
		let listeners: Record<string, (() => void)[]>;
		let addSpy: jest.Mock;
		let removeSpy: jest.Mock;

		beforeEach(() => {
			Platform.OS = 'web';
			listeners = {};
			addSpy = jest.fn((type: string, cb: () => void) => {
				(listeners[type] ??= []).push(cb);
			});
			removeSpy = jest.fn((type: string, cb: () => void) => {
				listeners[type] = (listeners[type] ?? []).filter((l) => l !== cb);
			});
			window.addEventListener = addSpy as typeof window.addEventListener;
			window.removeEventListener =
				removeSpy as typeof window.removeEventListener;
		});

		function fire(type: string) {
			(listeners[type] ?? []).forEach((cb) => cb());
		}

		it('reflects offline when the browser fires a real "offline" event, even if NetInfo never does', () => {
			const { result } = renderHook(() => useNetworkStatus());

			act(() => {
				fire('offline');
			});

			expect(result.current.isOffline).toBe(true);
		});

		it('recovers when the browser fires a real "online" event, even if NetInfo never does', () => {
			const { result } = renderHook(() => useNetworkStatus());

			act(() => {
				fire('offline');
			});
			expect(result.current.isOffline).toBe(true);

			act(() => {
				fire('online');
			});
			expect(result.current.isOffline).toBe(false);
		});

		it('removes its window event listeners on unmount', () => {
			const { unmount } = renderHook(() => useNetworkStatus());
			const addedTypes = addSpy.mock.calls.map(([type]) => type);
			expect(addedTypes).toEqual(expect.arrayContaining(['online', 'offline']));

			unmount();
			const removedTypes = removeSpy.mock.calls.map(([type]) => type);
			expect(removedTypes).toEqual(
				expect.arrayContaining(['online', 'offline']),
			);
		});
	});

	it('does not add window listeners on native platforms', () => {
		Platform.OS = 'ios';
		const addSpy = jest.fn();
		window.addEventListener = addSpy as typeof window.addEventListener;

		renderHook(() => useNetworkStatus());

		expect(addSpy).not.toHaveBeenCalled();
	});
});
