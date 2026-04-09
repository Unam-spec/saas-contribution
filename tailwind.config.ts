import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        inter:    ["var(--font-inter)", "Georgia", "serif"],
        playfair: ["var(--font-playfair)", "Georgia", "serif"],
      },
      colors: {
        ink:    "#1a1612",
        ink2:   "#4a4540",
        ink3:   "#8a8480",
        cream:  "#f9f6f0",
        cream2: "#f0ebe0",
        cream3: "#e5ddd0",
        gold:   "#9a7c3a",
        gold2:  "#c4a35a",
        gold3:  "#e8d5a8",
      },
    },
  },
  plugins: [],
};

export default config;
