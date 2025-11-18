// Get API URL - supports multiple environments
const getApiBaseUrl = (): string => {
  // Check for Vite environment variable
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    const viteUrl = import.meta.env.VITE_API_URL || import.meta.env.NEXT_PUBLIC_API_URL;
    if (viteUrl) return viteUrl;
  }
  
  // Check for Next.js / Node.js environment variable
  if (typeof process !== 'undefined' && process.env) {
    const nextUrl = process.env.NEXT_PUBLIC_API_URL;
    if (nextUrl) return nextUrl;
  }
  
  // Check for browser global
  if (typeof window !== 'undefined') {
    const windowUrl = (window as any).__API_URL__ || (window as any).__ENV__?.API_URL;
    if (windowUrl) return windowUrl;
  }
  
  // Default fallback - point to auth service for now
  // In production, this should be an API Gateway
  return 'http://localhost:3001';
};

export const API_BASE_URL = getApiBaseUrl();

// WebSocket URL
const getWsUrl = (): string => {
  if (typeof import !== 'undefined' && import.meta && import.meta.env) {
    const viteUrl = import.meta.env.VITE_WS_URL || import.meta.env.NEXT_PUBLIC_WS_URL;
    if (viteUrl) return viteUrl;
  }
  
  if (typeof process !== 'undefined' && process.env) {
    const nextUrl = process.env.NEXT_PUBLIC_WS_URL;
    if (nextUrl) return nextUrl;
  }
  
  if (typeof window !== 'undefined') {
    const windowUrl = (window as any).__WS_URL__ || (window as any).__ENV__?.WS_URL;
    if (windowUrl) return windowUrl;
  }
  
  return 'http://localhost:3003';
};

export const WS_URL = getWsUrl();
