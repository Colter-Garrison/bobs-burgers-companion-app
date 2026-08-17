/* eslint-env jest */
// Unlike a real device, the AsyncStorage jest mock's in-memory store
// persists across every test in a file, not just within one test — so a
// screen test that lets a fetch succeed (writing to the cache) would
// leak that cached data into a later test in the same file that expects
// a clean, uncached fetch failure. Clearing after each test keeps them
// isolated.
const AsyncStorage = require('@react-native-async-storage/async-storage');

afterEach(async () => {
	await AsyncStorage.clear();
});
