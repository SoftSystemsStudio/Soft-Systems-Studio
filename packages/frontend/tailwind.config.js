/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx}',
    './src/components/**/*.{js,ts,jsx,tsx}',
    './src/app/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Space Grotesk', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'Monaco', 'Courier New', 'monospace'],
      },
      colors: {
        sss: {
          bg: '#02040a',
          surface: '#050816',
          accent: '#c0ff6b',
          muted: '#9ca3af',
        },
        sys: {
          bg: '#F0F0F0',
          surface: '#FFFFFF',
          text: '#000000',
          muted: '#656565',
          border: '#000000',
          accent: '#00FF00',
          orange: '#FF6B00',
        },
        'sys-dark': {
          bg: '#000000',
          surface: '#0a0a0a',
          text: '#FFFFFF',
          muted: '#71717a',
          border: '#27272a',
          accent: '#c0ff6b',
          cyan: '#22d3ee',
          purple: '#a78bfa',
          orange: '#fb923c',
          pink: '#f472b6',
          green: '#10b981',
        },
      },
    },
  },
  plugins: [],
};
