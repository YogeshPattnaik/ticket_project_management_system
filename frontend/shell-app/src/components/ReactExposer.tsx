'use client';

import * as React from 'react';
import * as ReactDOM from 'react-dom';

/**
 * Exposes React and ReactDOM on window IMMEDIATELY (not in useEffect)
 * This ensures all MFEs use the same React instance from the host
 * Must be exposed before any MFE loads
 */
if (typeof window !== 'undefined') {
  (window as any).__REACT__ = React;
  (window as any).__REACT_DOM__ = ReactDOM;
  console.log('[ReactExposer] React and ReactDOM exposed on window immediately');
}

export function ReactExposer() {
  // Component just ensures this module is loaded early
  return null;
}

