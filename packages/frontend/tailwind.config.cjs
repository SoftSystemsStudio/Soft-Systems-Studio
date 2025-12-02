/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        bg: '#02040a',
        text: '#e5e7eb',
        muted: '#9ca3af',
        border: '#1f2933',
        surface: '#050816',
        accent: '#c0ff6b',
      },
    },
  },
  plugins: [],
};
