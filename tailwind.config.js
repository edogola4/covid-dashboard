/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
          primary: '#1e40af',
          secondary: '#059669',
          danger: '#dc2626',
          warning: '#d97706'
        }
    },
  },
  plugins: [],
};