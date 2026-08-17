const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Expo Router scans the whole `app/` directory for routes, which means
// Metro (the real app bundler) would otherwise try to bundle the
// *.test.tsx files colocated next to their screens in app/ — including
// @testing-library/react-native, which pulls in a Node-only "console"
// module that doesn't exist in a browser/RN bundle. Test files should
// never be part of the shipped app, so exclude them from Metro's module
// graph entirely, wherever they live.
config.resolver.blockList = [config.resolver.blockList, /\.test\.[jt]sx?$/];

module.exports = withNativeWind(config, { input: './global.css' });
