/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./public/**/*.html", "./src/**/*.{vue,js}"],
  theme: {
    extend: {}
  },
  plugins: [require("@tailwindcss/forms")]
};
