import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    rules: {
      // TanStack Table column defs need `any` for value generics in v8.
      "@typescript-eslint/no-explicit-any": "warn",
      // Vendored shadcn + debounce/effect patterns; treated as warnings.
      "react-hooks/set-state-in-effect": "warn",
    },
  },
]);

export default eslintConfig;
