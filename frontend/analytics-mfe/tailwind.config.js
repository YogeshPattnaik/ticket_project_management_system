/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Important: Only apply Tailwind to analytics-mfe container
  important: '.analytics-mfe-container',
  theme: {
    extend: {},
  },
  plugins: [],
};

