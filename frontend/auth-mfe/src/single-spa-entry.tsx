import * as LocalReact from 'react';
import * as LocalReactDOM from 'react-dom/client';
import singleSpaReact from 'single-spa-react';
import App from './App';
import './index.css';

// Get React instance - prefer host React, fallback to local
// Wait a bit for host React to be available (shell app loads first)
let React: any;
let ReactDOM: any;

if (typeof window !== 'undefined') {
  // Check immediately
  if ((window as any).__REACT__ && (window as any).__REACT_DOM__) {
    React = (window as any).__REACT__;
    ReactDOM = (window as any).__REACT_DOM__;
    console.log('[auth-mfe] Using host React (immediate)');
  } else {
    // Wait a bit for shell app to expose React
    // This is a fallback - the Vite plugin should handle most cases
    React = LocalReact;
    ReactDOM = LocalReactDOM;
    console.log('[auth-mfe] Using local React (host React not available yet)');
    
    // Try to get host React after a short delay
    setTimeout(() => {
      if ((window as any).__REACT__ && (window as any).__REACT_DOM__) {
        console.log('[auth-mfe] Host React now available, but already initialized with local React');
      }
    }, 100);
  }
} else {
  React = LocalReact;
  ReactDOM = LocalReactDOM;
}

// Ensure App is a valid component function
const RootComponent = typeof App === 'function' ? App : () => React.createElement('div', null, 'App component not found');

// Wrap App to ensure it uses the correct React instance
const WrappedApp = (props: any) => {
  return React.createElement(RootComponent, props);
};

const lifecycles = singleSpaReact({
  React,
  ReactDOM,
  rootComponent: WrappedApp,
  errorBoundary(err, info, props) {
    return React.createElement('div', { className: 'p-4 bg-red-50 border border-red-200 rounded' },
      React.createElement('h2', { className: 'text-red-800 font-bold' }, 'Error in Auth MFE'),
      React.createElement('p', { className: 'text-red-600' }, err.message)
    );
  },
  domElementGetter: () => {
    let el = document.getElementById('auth-mfe-container');
    if (!el) {
      el = document.createElement('div');
      el.id = 'auth-mfe-container';
      el.className = 'w-full h-full min-h-[400px]';
      document.body.appendChild(el);
    }
    return el;
  },
});

export const { bootstrap, mount, unmount } = lifecycles;

