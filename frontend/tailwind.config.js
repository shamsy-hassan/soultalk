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
        // App theme tokens (powered by CSS variables; see src/index.css).
        'heybuddy-white': 'rgb(var(--st-white) / <alpha-value>)', // base background
        'heybuddy-warm-gray': 'rgb(var(--st-warm-gray) / <alpha-value>)', // surface / panels
        'heybuddy-coral': 'rgb(var(--st-coral) / <alpha-value>)', // primary accent
        'heybuddy-teal': 'rgb(var(--st-teal) / <alpha-value>)', // secondary accent
        'heybuddy-lavender': 'rgb(var(--st-lavender) / <alpha-value>)', // focus / strong accent
        'heybuddy-dark-gray': 'rgb(var(--st-dark-gray) / <alpha-value>)', // primary text
        'heybuddy-medium-gray': 'rgb(var(--st-medium-gray) / <alpha-value>)', // muted text
        // Primary gradient
        'heybuddy-gradient-start': 'rgb(var(--st-gradient-start) / <alpha-value>)',
        'heybuddy-gradient-end': 'rgb(var(--st-gradient-end) / <alpha-value>)',

        // Make existing `emerald-*` utilities theme-aware (the UI uses these a lot).
        emerald: {
          50: 'rgb(var(--st-dark-gray) / <alpha-value>)',
          100: 'rgb(var(--st-dark-gray) / <alpha-value>)',
          200: 'rgb(var(--st-medium-gray) / <alpha-value>)',
          300: 'rgb(var(--st-medium-gray) / <alpha-value>)',
          400: 'rgb(var(--st-lavender) / <alpha-value>)',
          500: 'rgb(var(--st-coral) / <alpha-value>)',
          600: 'rgb(var(--st-gradient-end) / <alpha-value>)',
          700: 'rgb(var(--st-gradient-end) / <alpha-value>)',
          800: 'rgb(var(--st-warm-gray) / <alpha-value>)',
          900: 'rgb(var(--st-white) / <alpha-value>)',
          950: 'rgb(var(--st-white) / <alpha-value>)',
        },
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
