import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}", "./types/**/*.{ts,tsx}"],
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

export default config;
