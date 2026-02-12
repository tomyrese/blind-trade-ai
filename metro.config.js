const { getDefaultConfig } = require('@react-native/metro-config');

const path = require('path');

const config = getDefaultConfig(__dirname);

// Bỏ qua folder build C++ của Android
config.watchFolders = [];
config.resolver.blockList = [
  /android\/\.cxx\/.*/,
  /node_modules\/.*\/android\/\.cxx\/.*/
];

// Deduplicate Three.js
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  three: path.resolve(__dirname, 'node_modules/three'),
};

module.exports = config;
