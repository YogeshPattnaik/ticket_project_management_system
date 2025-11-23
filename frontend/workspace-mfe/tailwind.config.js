/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Important: Only apply Tailwind to workspace-mfe container
  important: '.workspace-mfe-container',
  theme: {
    extend: {},
  },
  plugins: [],
}

