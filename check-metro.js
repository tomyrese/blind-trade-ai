const { getDefaultConfig } = require('@react-native/metro-config');
const config = getDefaultConfig(__dirname);

console.log('Default sourceExts:', config.resolver.sourceExts);
console.log('Default assetExts:', config.resolver.assetExts);

config.resolver.sourceExts.push('cjs');
config.resolver.sourceExts.push('mjs');

console.log('Modified sourceExts:', config.resolver.sourceExts);
