/** @type {import("prettier").Config} */
const config = {
  $schema: "https://json.schemastore.org/prettierrc",
  semi: false,
  trailingComma: "all",
  singleAttributePerLine: true,
  plugins: [require.resolve("prettier-plugin-tailwindcss")],
  tailwindConfig: "./tailwind.config.js",
}

module.exports = config
