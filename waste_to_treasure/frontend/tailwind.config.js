/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Primary colors (del SRS)
        primary: {
          500: '#396539',
          600: '#294730',
        },
        // Secondary colors
        secondary: {
          500: '#69391E',
          600: '#A2704F',
        },
        // Neutral colors
        neutral: {
          900: '#262C32',
          100: '#F3F3F3',
          50: '#FCFCFC',
        },
      },
      fontFamily: {
        poppins: ['Poppins', 'sans-serif'],
        roboto: ['Roboto', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
