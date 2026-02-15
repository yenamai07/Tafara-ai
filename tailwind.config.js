/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'tafara-teal': '#3dd9d9',
        'tafara-cyan': '#4de8e8',
        'tafara-blue': '#1e3a5f',
        'tafara-dark': '#0f1f3a',
      },
    },
  },
  plugins: [],
}
