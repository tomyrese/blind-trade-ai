const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

// TEMPORARY: NativeWind disabled due to Node 24 ESM compatibility issue
// Will add back with alternative setup
// const { withNativeWind } = require('nativewind/metro');
// module.exports = withNativeWind(config, {
//   input: './global.css',
//   inlineRem: 16,
// });

module.exports = config;
