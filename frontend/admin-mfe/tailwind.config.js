/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Enable class-based dark mode
  // Don't use important selector - it breaks Tailwind utilities
  // Instead, rely on CSS specificity through the container class
  theme: {
    extend: {
      colors: {
        // Custom colors for admin theme - matching reference design
        admin: {
          dark: {
            bg: '#111827', // Dark gray background
            sidebar: '#111827',
            header: '#111827',
            card: '#1f2937', // Slightly lighter for cards
            border: '#374151', // Border color
          },
          teal: {
            primary: '#14b8a6', // Teal accent
            hover: '#0d9488',
            light: '#5eead4',
          },
        },
      },
    },
  },
  plugins: [],
}

