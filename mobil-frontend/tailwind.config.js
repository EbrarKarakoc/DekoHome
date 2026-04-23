/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all of your component files.
  content: ['./app/**/*.{js,jsx,ts,tsx}', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#fefce8',
          100: '#fef9c3',
          500: '#eab308',
          600: '#D48806', // Exact web mustard yellow
          700: '#a16207',
        },
        slate: {
          900: '#0f172a',
          800: '#1e293b',
          700: '#334155',
          600: '#475569',
          500: '#64748b',
        },
      },
      fontFamily: {
        playfair: ['PlayfairDisplay_700Bold'],
        inter: ['Inter_400Regular'],
        'inter-bold': ['Inter_700Bold'],
      },
    },
  },
  plugins: [],
};
