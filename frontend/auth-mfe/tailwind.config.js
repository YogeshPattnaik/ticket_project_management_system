/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  // Important: Only apply Tailwind to auth-mfe container
  important: '.auth-mfe-container',
  theme: {
    extend: {},
  },
  plugins: [],
}

