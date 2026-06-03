/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        ink: "#172033",
        mist: "#eef2f7",
        meadow: "#2f8f6f",
        coral: "#d95f43",
        amber: "#c98a24",
        ocean: "#2563eb"
      }
    }
  },
  plugins: []
};
