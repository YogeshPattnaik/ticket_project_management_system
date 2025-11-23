/**
 * React shim that uses host's React if available
 * This ensures MFE components use the same React instance as the host
 * 
 * Vite will resolve this file when 'react' is imported.
 * At runtime, we check window.__REACT__ first, then fall back to the actual react package.
 */

// At build time, Vite will see these imports and bundle them
// At runtime, we override with window.__REACT__ if available
import * as LocalReact from 'react';
import * as LocalReactDOM from 'react-dom';

// Get React from host if available, otherwise use local
const React = (typeof window !== 'undefined' && (window as any).__REACT__) 
  ? (window as any).__REACT__ 
  : LocalReact;

const ReactDOM = (typeof window !== 'undefined' && (window as any).__REACT_DOM__) 
  ? (window as any).__REACT_DOM__ 
  : LocalReactDOM;

if (typeof window !== 'undefined' && (window as any).__REACT__) {
  console.log('[ReactShim] Using host React');
} else {
  console.log('[ReactShim] Using local React (host React not available)');
}

// Re-export everything from the chosen React
export default React;
export * from 'react';
export { ReactDOM };
export * from 'react-dom';

