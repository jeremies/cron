/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        google: {
          blue: '#1a73e8',
          blueHover: '#1557b0',
          blueLight: '#e8f0fe',
          blueDark: '#8ab4f8',
          grayBg: '#f8f9fa',
          cardBorder: '#dadce0',
          darkBg: '#202124',
          darkCard: '#303134',
          darkBorder: '#3c4043',
          darkBlue: '#8ab4f8',
        }
      },
      fontFamily: {
        sans: ['"Google Sans"', 'Roboto', 'Arial', 'sans-serif'],
      }
    },
  },
  plugins: [],
}
