import { LogBox } from 'react-native';

export const ignoreLogs = () => {
  LogBox.ignoreLogs([
    'EXGL: gl.pixelStorei() doesn\'t support this parameter yet!',
    'THREE.WebGLProgram: Program Info Log: Fragment info',
    'semi-transparent value',
    'material.dispersion',
  ]);

  const _consoleWarn = console.warn;
  console.warn = (...args) => {
    const message = args.map(arg => String(arg)).join(' ');
    
    const ignored = [
      'EXGL: gl.pixelStorei()',
      'THREE.WebGLProgram',
      'material.dispersion',
      'SafeAreaView has been deprecated',
      'Multiple instances of Three.js',
      'THREE.WARNING: Multiple instances',
      'EXPO_OS is not defined'
    ];

    if (ignored.some(pattern => message.includes(pattern))) {
      return;
    }
    
    _consoleWarn(...args);
  };

  const _consoleError = console.error;
  console.error = (...args) => {
    const message = args.map(arg => String(arg)).join(' ');
    
    // Ignore non-critical runtime library errors
    if (message.includes('EXPO_OS is not defined') || message.includes('EXGL: gl.pixelStorei()')) {
      return;
    }
    
    // For React hook errors, try to provide more context if possible
    if (message.includes('Rendered fewer hooks than expected')) {
      _consoleError('[HOOK MISMATCH DETECTED]', message);
      const stack = args.find(arg => arg && typeof arg === 'object' && arg.componentStack);
      if (stack) {
        _consoleError('[COMPONENT STACK]', stack.componentStack);
      }
      return;
    }
    
    _consoleError(...args);
  };
};
