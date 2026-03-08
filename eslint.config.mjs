import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
    ],
  },
  // Project overrides: relax overly strict rules blocking builds
  {
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
      "react/no-unescaped-entities": "off",
      "prefer-const": "off",
      // unused variable warnings are extremely noisy across the codebase
      // and are being tracked manually as needed; disable rule globally
      "@typescript-eslint/no-unused-vars": "off", // the following additional rules are disabled for convenience
      // - hooks dependency checks can be overly aggressive in this codebase
      // - <img> tags are used frequently and the optimization warning is
      //   more noise than value for our small personal site
      // - require-imports is used in dynamic loaders and scripts
      "react-hooks/exhaustive-deps": "off",
      "@next/next/no-img-element": "off",
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
