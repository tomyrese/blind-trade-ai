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
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('EXGL: gl.pixelStorei()')) return;
      if (args[0].includes('THREE.WebGLProgram')) return;
      if (args[0].includes('material.dispersion')) return; 
    }
    _consoleWarn(...args);
  };

  const _consoleError = console.error;
  console.error = (...args) => {
    if (args[0] && typeof args[0] === 'string') {
      if (args[0].includes('EXGL: gl.pixelStorei()')) return;
    }
    _consoleError(...args);
  };
};
