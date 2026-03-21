/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        neutral: "#121214",
        primary: "#0df2f2",
        secondary: "#0deafc",
        tertiary: "#0095e2",
        background: "#0a0a0a",
        surface: "#18181b",
        card: "#18181b",
        accent: "#ff00ff",
        text: "#fbf9f9",
      },
      fontFamily: {
        lexend: ["Lexend-Regular", "sans-serif"],
        "lexend-bold": ["Lexend-Bold", "sans-serif"],
        "lexend-black": ["Lexend-Black", "sans-serif"],
      },
    },
  },
  plugins: [],
}

