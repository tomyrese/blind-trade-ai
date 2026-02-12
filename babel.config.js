module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  // TEMPORARY: NativeWind preset disabled
  // presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    '@babel/plugin-transform-export-namespace-from',
    'react-native-reanimated/plugin', // Must be last
  ],
};
