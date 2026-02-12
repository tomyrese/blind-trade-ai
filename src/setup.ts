// 1. Global Environment Setup - MUST BE FIRST
if (typeof process === 'undefined') {
  global.process = { env: { EXPO_OS: 'android' } };
} else if (!process.env.EXPO_OS) {
  process.env.EXPO_OS = 'android';
}

// 2. Global Log Suppression
const { ignoreLogs } = require('./shared/utils/ignoreLogs');
ignoreLogs();

// 3. Native Modules & Polyfills
require('react-native-screens').enableScreens();
