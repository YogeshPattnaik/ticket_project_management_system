/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  // Important: Only apply Tailwind to shell-app components
  // MFEs have their own Tailwind configs
  important: true, // Shell-app is root, so use !important
  theme: {
    extend: {},
  },
  plugins: [],
};
