/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soultalk-light': '#E0F2F7', // Example light blue/cyan
        'soultalk-primary': '#4C51BF', // Example deep purple
        'soultalk-secondary': '#10B981', // Example emerald green
      },
    },
  },
  plugins: [],
}
