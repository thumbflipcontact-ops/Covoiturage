/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#7C3AED",
          light: "#A855F7",
          dark: "#4C1D95",
        },
      },
      backgroundImage: {
        "primary-gradient": "linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #F97316 100%)",
      },
    },
  },
  plugins: [],
};

