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
        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        display: ['"Fraunces Variable"', 'Fraunces', 'Georgia', 'serif'],
        scribble: ['Caveat', '"Comic Sans MS"', 'cursive'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'Courier New', 'monospace'],
      },
      colors: {
        cream: '#FFF9ED',
        parchment: '#FAF5E8',
        ink: '#111111',
        cyber: '#FFF500',
        punch: '#FF007A',
        volt: '#00D1FF',
        blaze: '#FF5C00',

        // legacy-compatible tokens (re-pointed to the zine palette)
        canvas: '#FAF5E8',
        'canary': '#FFF500',
        'canary-light': '#FFF9B0',
        lavender: '#FFD9E8',
        mint: '#C7F0DB',
        coral: '#FFC9A3',
        skybadge: '#BDEBFF',

        black: '#111111',
      },
      borderWidth: {
        3: '3px',
      },
      boxShadow: {
        'brutal': '4px 4px 0px 0px #111111',
        'brutal-sm': '3px 3px 0px 0px #111111',
        'brutal-lg': '6px 6px 0px 0px #111111',
        'brutal-none': '0px 0px 0px 0px #111111',
        'brutal-dark': '4px 4px 0px 0px #d4d4d4',
        'brutal-dark-lg': '6px 6px 0px 0px #d4d4d4',
      },
    },
  },
  plugins: [],
};