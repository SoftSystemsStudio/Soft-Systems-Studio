/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/pages/**/*.{js,ts,jsx,tsx}', './src/components/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        sss: {
          bg: '#02040a',
          surface: '#050816',
          accent: '#c0ff6b',
          muted: '#9ca3af',
        },
      },
    },
  },
  plugins: [],
};
