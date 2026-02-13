// 1. Global Environment Setup - MUST BE FIRST
const g = global as any;
if (typeof g.process === 'undefined') {
  g.process = { env: { EXPO_OS: 'android' } };
} else if (!g.process.env.EXPO_OS) {
  g.process.env.EXPO_OS = 'android';
}

// 2. Global Log Suppression
const { ignoreLogs } = require('./shared/utils/ignoreLogs');
ignoreLogs();

// 3. Native Modules & Polyfills
require('react-native-screens').enableScreens();

// 4. DOM Polyfills for 3D Libraries (Three.js/GLTFLoader)
if (typeof g.document === 'undefined') {
  g.document = {
    createElement: (tag: string) => {
      if (tag === 'img') {
        return {
          style: {},
          addEventListener: function(name: string, handler: any) {
             if (name === 'load') (this as any).onload = handler;
             if (name === 'error') (this as any).onerror = handler;
          },
          removeEventListener: () => {},
        };
      }
      return {
        style: {},
        addEventListener: () => {},
        removeEventListener: () => {},
      };
    },
    createElementNS: () => ({
      style: {},
      addEventListener: () => {},
      removeEventListener: () => {},
    }),
    getElementsByTagName: () => [],
  };
}
if (typeof g.window === 'undefined') {
  g.window = g;
}
if (typeof g.location === 'undefined') {
  g.location = { href: '' };
}
