/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#f4f7f3',
          100: '#e6ede3',
          200: '#c9dac2',
          300: '#a3c096',
          400: '#79a267',
          500: '#5a8548',
          600: '#456937',
          700: '#38542e',
          800: '#2f4427',
          900: '#293a22',
        },
        sand: {
          50: '#fdfaf5',
          100: '#f8f1e4',
          200: '#efe0c4',
        }
      },
      fontFamily: {
        display: ['"Fraunces"', 'serif'],
        body: ['"Inter"', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
