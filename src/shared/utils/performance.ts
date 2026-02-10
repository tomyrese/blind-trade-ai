// Performance Utilities
import { useCallback, useMemo, DependencyList } from 'react';

/**
 * Create a stable callback that won't change unless dependencies change
 * Use for event handlers passed to child components
 */
export const useStableCallback = <T extends (...args: any[]) => any>(
  callback: T,
  deps: DependencyList
): T => {
  return useCallback(callback, deps);
};

/**
 * Memoize expensive computations
 */
export const useComputedValue = <T>(
  factory: () => T,
  deps: DependencyList
): T => {
  return useMemo(factory, deps);
};

/**
 * Debounce hook for performance-sensitive operations
 */
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = React.useState(value);

  React.useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

/**
 * Throttle hook for limiting function executions
 */
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
): T => {
  const lastRun = React.useRef(Date.now());

  return useCallback(
    ((...args) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        lastRun.current = now;
        return callback(...args);
      }
    }) as T,
    [callback, delay]
  );
};

import React from 'react';

// Type-safe memo wrapper
export const memo = React.memo;

// Check if values are equal (shallow comparison)
export const shallowEqual = (obj1: any, obj2: any): boolean => {
  if (obj1 === obj2) return true;
  if (!obj1 || !obj2) return false;

  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every((key) => obj1[key] === obj2[key]);
};
