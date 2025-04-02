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
        'md-h': { 'raw': '(max-height: 640px)' },
        'lg-h': { 'raw': '(max-height: 1024px)' },
      },
    },
  },
  plugins: [
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
    require("@tailwindcss/aspect-ratio")
  ],
};
