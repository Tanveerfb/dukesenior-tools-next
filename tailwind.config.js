/** @type {import('tailwindcss').Config} */
// eslint-disable-next-line @typescript-eslint/no-require-imports
const typography = require('@tailwindcss/typography');

module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#ab2fb1',
          50: '#faf5fb',
          100: '#f4ebf6',
          200: '#ead6ed',
          300: '#dbb5df',
          400: '#c587cb',
          500: '#ab2fb1',
          600: '#943d9b',
          700: '#7c307f',
          800: '#672969',
          900: '#562658',
        },
        secondary: {
          DEFAULT: '#36453b',
          50: '#f6f7f7',
          100: '#e2e5e3',
          200: '#c4cbc7',
          300: '#9fa9a3',
          400: '#7a8780',
          500: '#5f6d64',
          600: '#4d584f',
          700: '#36453b',
          800: '#2e3933',
          900: '#27302b',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [typography],
  corePlugins: {
    preflight: false,
  },
};
