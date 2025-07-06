/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'primary-blue': '#00d4ff',
        'primary-purple': '#7b2cbf',
        'background-dark': '#0a0a0a',
        'background-darker': '#121212',
        'text-primary': '#ffffff',
        'text-secondary': '#e0e0e0',
        'text-muted': '#b0b0b0',
      },
      fontFamily: {
        'inter': ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
