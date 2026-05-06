/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "Inter", "sans-serif"],
        display: ["var(--font-display)", "Syne", "sans-serif"],
      },
      colors: {
        brand: {
          primary: "#7C3AED",
          yellow: "#FFFF00",
          black: "#0F051D",
          grey: "#121217",
        },
      },
    },
  },
  plugins: [],
};
