module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#21209C", // Default text color
        secondary: "#FDB827", // Hover text color
        background: "#F1F1F1", // Background color
        accent: "#23120B", // Icon/button color
      },
      animation: {
        "fade-in-out": "fadeInOut 3s ease-in-out",
      },
      keyframes: {
        fadeInOut: {
          "0%": { opacity: 0, transform: "translateY(-10px)" },
          "10%": { opacity: 1, transform: "translateY(0)" },
          "90%": { opacity: 1, transform: "translateY(0)" },
          "100%": { opacity: 0, transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
};