/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'media',
  content: ["./src/**/*.{html,js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Segoe UI', 'SF Pro Text', 'Ubuntu', 'Arial', 'sans-serif'],
      },
      screens: {
        'lg-h': { 'raw': '(min-height: 1280px)' },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio")
  ],
};
