/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'mko-green': '#2d5a3e',
        'mko-light': '#e8f0eb',
      }
    },
  },
  plugins: [],
}