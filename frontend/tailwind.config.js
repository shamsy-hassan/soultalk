/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soultalk-white': '#FFFFFF',
        'soultalk-warm-gray': '#F8FAFC',
        'soultalk-coral': '#F43F5E',
        'soultalk-teal': '#14B8A6',
        'soultalk-lavender': '#4F46E5',
        'soultalk-dark-gray': '#0F172A',
        'soultalk-medium-gray': '#475569',
        // For primary gradient as specified:
        'soultalk-gradient-start': '#6366F1',
        'soultalk-gradient-end': '#14B8A6',
      }, // Correctly close the colors object here
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.05)', opacity: '0.8' },
        },
        'float-one': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px) translateX(5px)' },
          '100%': { transform: 'translateY(0px)' },
        },
        'float-two': {
          '0%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(10px) translateX(-5px)' },
          '100%': { transform: 'translateY(0px)' },
        },
      },
      animation: {
        'pulse-slow': 'pulse-slow 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float-one': 'float-one 3s ease-in-out infinite',
        'float-two': 'float-two 4s ease-in-out infinite alternate',
      },
    },
  },
  plugins: [],
}
