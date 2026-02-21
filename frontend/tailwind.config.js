/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'soultalk-white': '#FFFFFF',
        'soultalk-warm-gray': '#F7F7F7',
        'soultalk-coral': '#FF6B6B',
        'soultalk-teal': '#4ECDC4',
        'soultalk-lavender': '#9B87F5',
        'soultalk-dark-gray': '#2D3436',
        'soultalk-medium-gray': '#636E72',
        // For primary gradient as specified:
        'soultalk-gradient-start': '#FF6B6B',
        'soultalk-gradient-end': '#4ECDC4',
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
