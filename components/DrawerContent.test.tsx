import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import { DrawerContentComponentProps } from '@react-navigation/drawer';
import { DrawerContent } from './DrawerContent';
import { useAuth } from '../hooks/useAuth';

jest.mock('../hooks/useAuth');
jest.mock('expo-router', () => ({
	useRouter: jest.fn(),
}));
// Needs a real <SafeAreaProvider> ancestor this bare render() never sets
// up — not this component's logic to test, so just stub a zero inset.
jest.mock('react-native-safe-area-context', () => ({
	useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
}));
// The real DrawerContentScrollView/DrawerItemList need a live navigation
// state (drawer routes, descriptors) this test never constructs — they're
// react-navigation's own machinery, not this component's logic. Stand
// them in with plain View/Text so only DrawerContent's own auth-aware
// section is under test here. DrawerItem (used for the Favorites link) is
// stubbed just enough to stay pressable/findable by label.
jest.mock('@react-navigation/drawer', () => {
	const { Pressable, Text, View } = jest.requireActual('react-native');
	return {
		DrawerContentScrollView: ({ children }: { children: React.ReactNode }) => (
			<View>{children}</View>
		),
		DrawerItemList: () => <Text>DrawerItemList</Text>,
		DrawerItem: ({
			label,
			onPress,
		}: {
			label: string;
			onPress: () => void;
		}) => (
			<Pressable onPress={onPress} accessibilityRole='button'>
				<Text>{label}</Text>
			</Pressable>
		),
	};
});

// DrawerContent only ever spreads these into the (here, mocked-out)
// DrawerContentScrollView/DrawerItemList, so a real navigation state
// isn't needed for this component's own logic to be exercised.
const fakeDrawerProps = {} as unknown as DrawerContentComponentProps;

describe('DrawerContent', () => {
	const mockPush = jest.fn();
	const mockLogout = jest.fn();

	beforeEach(() => {
		(useRouter as jest.Mock).mockReturnValue({ push: mockPush });
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	it('shows Log In / Sign Up links at the top when logged out', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			email: null,
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.getByText('Log In')).toBeVisible();
		expect(screen.getByText('Sign Up')).toBeVisible();
		expect(screen.queryByText(/^Hello:/)).toBeNull();
		expect(screen.queryByText('Favorites')).toBeNull();
		expect(screen.queryByText('Log Out')).toBeNull();

		fireEvent.press(screen.getByText('Log In'));
		expect(mockPush).toHaveBeenCalledWith('/login');

		fireEvent.press(screen.getByText('Sign Up'));
		expect(mockPush).toHaveBeenCalledWith('/signup');
	});

	it('shows "Hello: email", Favorites, and Log Out when logged in', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			email: 'bob@bobsburgers.com',
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.queryByText('Log In')).toBeNull();
		expect(screen.queryByText('Sign Up')).toBeNull();
		expect(screen.queryByText('Account')).toBeNull();

		fireEvent.press(screen.getByText('Hello: bob@bobsburgers.com'));
		expect(mockPush).toHaveBeenCalledWith('/account');

		fireEvent.press(screen.getByText('Favorites'));
		expect(mockPush).toHaveBeenCalledWith('/favorites');
	});

	it('Log Out logs out and navigates home', async () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			email: 'bob@bobsburgers.com',
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		await fireEvent.press(screen.getByText('Log Out'));
		expect(mockLogout).toHaveBeenCalled();
		expect(mockPush).toHaveBeenCalledWith('/');
	});

	it('always renders the category link list', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			email: null,
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.getByText('DrawerItemList')).toBeVisible();
	});
});
