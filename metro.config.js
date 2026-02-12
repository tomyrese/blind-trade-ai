const { getDefaultConfig } = require('@react-native/metro-config');

const config = getDefaultConfig(__dirname);

// Bỏ qua folder build C++ của Android
config.watchFolders = [];
config.resolver.blockList = [
  /android\/\.cxx\/.*/,
  /node_modules\/.*\/android\/\.cxx\/.*/
];

module.exports = config;
