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
// The real DrawerContentScrollView/DrawerItemList need a live navigation
// state (drawer routes, descriptors) this test never constructs — they're
// react-navigation's own machinery, not this component's logic. Stand
// them in with plain View/Text so only DrawerContent's own auth-aware
// section is under test here.
jest.mock('@react-navigation/drawer', () => {
	const { View, Text } = jest.requireActual('react-native');
	return {
		DrawerContentScrollView: ({ children }: { children: React.ReactNode }) => (
			<View>{children}</View>
		),
		DrawerItemList: () => <Text>DrawerItemList</Text>,
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

	it('shows Log In / Sign Up links when logged out', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: null,
			email: null,
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.getByText('Log In')).toBeVisible();
		expect(screen.getByText('Sign Up')).toBeVisible();
		expect(screen.queryByText(/Logged in as/)).toBeNull();

		fireEvent.press(screen.getByText('Log In'));
		expect(mockPush).toHaveBeenCalledWith('/login');

		fireEvent.press(screen.getByText('Sign Up'));
		expect(mockPush).toHaveBeenCalledWith('/signup');
	});

	it('shows the logged-in email and a Log Out action when logged in', () => {
		(useAuth as jest.Mock).mockReturnValue({
			token: 'token-abc',
			email: 'bob@bobsburgers.com',
			logout: mockLogout,
		});

		render(<DrawerContent {...fakeDrawerProps} />);

		expect(screen.getByText('Logged in as bob@bobsburgers.com')).toBeVisible();
		expect(screen.queryByText('Log In')).toBeNull();
		expect(screen.queryByText('Sign Up')).toBeNull();

		fireEvent.press(screen.getByText('Log Out'));
		expect(mockLogout).toHaveBeenCalled();
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
