import eslintJs from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist/**", "build/**", "node_modules/**"]
  },
  {
    files: ["**/*.ts", "**/*.tsx"],
    extends: [eslintJs.configs.recommended, ...tseslint.configs.recommended],
    rules: {
      "no-console": ["warn", { allow: ["warn", "error"] }]
    }
  }
);

