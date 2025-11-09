/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          500: '#396539',
          600: '#294730',
        },
        secondary: {
          500: '#69391E',
          600: '#A2704F',
        },
        neutral: {
          900: '#262C32',
          100: '#F3F3F3',
          50: '#FCFCFC',
        },
      },
      fontFamily: {
        poppins: ['var(--font-poppins)'],
        roboto: ['var(--font-roboto)'],
        inter: ['var(--font-inter)'],
      },
    },
  },
}

