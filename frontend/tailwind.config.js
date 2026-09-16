/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './**/*.html',
    './**/*.js',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
      colors: {
        canvas: '#faf7f2',
        'canvas-dark': '#171717',
        'canary': '#fde047',
        'canary-light': '#fef08a',
        lavender: '#e9d5ff',
        mint: '#a7f3d0',
        coral: '#fecdd3',
        skybadge: '#bae6fd',
      },
      boxShadow: {
        'brutal': '3px 3px 0px 0px #000000',
        'brutal-sm': '2px 2px 0px 0px #000000',
        'brutal-lg': '4px 4px 0px 0px #000000',
        'brutal-none': '0px 0px 0px 0px #000000',
        'brutal-dark': '3px 3px 0px 0px #555555',
        'brutal-dark-lg': '4px 4px 0px 0px #555555',
      },
    },
  },
  plugins: [],
};
