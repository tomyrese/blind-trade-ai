const { getDefaultConfig } = require('@react-native/metro-config');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

const path = require('path');

// Add cjs to sourceExts for compatibility with some libraries (like three.js, expo modules)
config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'expo-asset') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/expo-asset/build/index.js'),
      type: 'sourceFile',
    };
  }
  if (moduleName === 'three') {
    return {
      filePath: path.resolve(__dirname, 'node_modules/three/build/three.cjs'),
      type: 'sourceFile',
    };
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
