/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./App.tsx", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "#F9F9FB",
        surface: "#FFFFFF",
        surfaceSoft: "#F3F4F8",
        border: "#E6E8F0",
        text: "#17181C",
        muted: "#6F7483",
        accent: "#6D4AFF",
        accentSoft: "#EEE9FF",
        mint: "#CFF6E4",
        sky: "#DCEEFF",
        peach: "#FFF0E3"
      },
      borderRadius: {
        card: "24px",
        pill: "999px"
      },
      boxShadow: {
        soft: "0 12px 32px rgba(23, 24, 28, 0.08)"
      }
    },
  },
  plugins: [],
};
