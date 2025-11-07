/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'brand-blue': {
          DEFAULT: '#1e40af', 
          dark: '#1e3a8a',  
          light: '#2563eb', 
        },
        'brand-gray': {
          light: '#f9fafb', 
          mid: '#e5e7eb', 
        },
        'brand-accent': '#10b981', 
      }
    },
  },
  plugins: [],
}