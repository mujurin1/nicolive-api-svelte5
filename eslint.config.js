import js from "@eslint/js";
// import prettier from "eslint-config-prettier";
import svelte from "eslint-plugin-svelte";
import globals from "globals";
import svelteParser from "svelte-eslint-parser";
import tsEslint from "typescript-eslint";

const isProduction = () => process.env.NODE_ENV === "production";

const defaultConfig = tsEslint.config({
  files: ["src/**/*.js", "src/**/*.ts", "src/**/*.svelte"],
  extends: [
    js.configs.recommended,
    ...tsEslint.configs.strictTypeChecked,
    ...tsEslint.configs.stylisticTypeChecked,
    // prettier,
  ],
  languageOptions: {
    parser: tsEslint.parser,
    parserOptions: {
      sourceType: "module",
      ecmaVersion: "latest", // 2023
      project: "./tsconfig.json",
      tsconfigRootDir: import.meta.dirname,
      extraFileExtensions: [".svelte"]
    },
    globals: { ...globals.browser, ...globals.es2021, ...globals.node }
  },
  rules: {
    "no-console": isProduction() ? "error" : "off",

    "eqeqeq": ["error", "always", { null: "ignore" }],
    "no-duplicate-imports": ["error", { includeExports: true }],
    // "no-restricted-imports": [
    //   "error",
    //   { patterns: [{ group: ["../*", "src/lib/*"], message: "use `$lib/*` instead" }] }
    // ],
    "no-trailing-spaces": "off",
    "no-unused-expressions": "error",
    "no-var": "error",
    "no-empty": "off",
    "no-unused-vars": "off",
    "prefer-const": "warn",
    "camelcase": "off",

    "@typescript-eslint/no-extraneous-class": "off",
    "@typescript-eslint/switch-exhaustiveness-check": "warn",
    "@typescript-eslint/no-unnecessary-type-arguments": "off",
    "@typescript-eslint/no-unnecessary-type-assertion": "off",
    "@typescript-eslint/no-unnecessary-condition": "off",
    "@typescript-eslint/no-unnecessary-qualifier": "error",
    "@typescript-eslint/no-unsafe-assignment": "off",
    "@typescript-eslint/no-unsafe-argument": "off",
    "@typescript-eslint/no-unsafe-member-access": "off",
    "@typescript-eslint/no-unsafe-call": "off",
    "@typescript-eslint/no-unsafe-unary-minus": "error",
    "@typescript-eslint/no-empty-function": "off",
    "@typescript-eslint/no-empty-interface": "off",
    "@typescript-eslint/no-useless-constructor": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/no-duplicate-type-constituents": "off",
    "@typescript-eslint/no-invalid-void-type": "off",
    "@typescript-eslint/no-floating-promises": "warn",
    "@typescript-eslint/no-confusing-void-expression": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "@typescript-eslint/no-import-type-side-effects": "error",
    "@typescript-eslint/no-require-imports": "error",
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "@typescript-eslint/no-useless-empty-export": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/non-nullable-type-assertion-style": "warn",
    "@typescript-eslint/prefer-enum-initializers": "error",
    "@typescript-eslint/prefer-readonly": "warn",
    "@typescript-eslint/prefer-regexp-exec": "error",
    "@typescript-eslint/restrict-plus-operands": "off",
    "@typescript-eslint/restrict-template-expressions": "off",
    "@typescript-eslint/consistent-type-assertions": "off",
    // "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    "@typescript-eslint/consistent-type-exports": "error",
    "@typescript-eslint/consistent-type-imports": "error",
    // "@typescript-eslint/explicit-function-return-type": "error",
    "@typescript-eslint/member-delimiter-style": "off", //
    "@typescript-eslint/method-signature-style": "off",
    "@typescript-eslint/promise-function-async": "off",
    "@typescript-eslint/require-array-sort-compare": "error",

    "@typescript-eslint/unbound-method": "warn",
  }
});

const svelteConfig = tsEslint.config({
  files: ["src/**/*.svelte"],
  extends: [
    ...svelte.configs["flat/all"],
    ...svelte.configs["flat/prettier"]
  ],
  languageOptions: {
    parser: svelteParser,
    parserOptions: { parser: tsEslint.parser }
  },
  /** @type {import("eslint").Linter.RulesRecord} */
  rules: {
    "svelte/no-reactive-reassign": ["error", { props: true }],
    "svelte/block-lang": ["error", { script: "ts", style: null }],
    "svelte/no-inline-styles": "warn", // off
    "svelte/no-unused-class-name": "warn",
    "svelte/no-useless-mustaches": "warn",
    "svelte/no-restricted-html-elements": "warn", // off
    "svelte/require-optimized-style-attribute": "warn",
    "svelte/sort-attributes": "warn", // off
    "svelte/experimental-require-slot-types": "warn", // off
    "svelte/experimental-require-strict-events": "warn", // off
    "svelte/no-trailing-spaces": ["warn", { skipBlankLines: false, ignoreComments: false }]
  }
});

/** @typedef {import("@typescript-eslint/utils").TSESLint.FlatConfig.Config} FlatConfig */

/** @type {FlatConfig} */
const jsConfig = {
  files: ["src/**/*.js"],
  rules: { "@typescript-eslint/explicit-function-return-type": "off" }
};

/** @type {FlatConfig} */
const configConfig = {
  files: ["**/*.config.*"],
  rules: { "@typescript-eslint/naming-convention": "off" }
};

/** @type {FlatConfig[]} */
export default [
  ...defaultConfig,
  ...svelteConfig,
  jsConfig,
  configConfig,
  { linterOptions: { reportUnusedDisableDirectives: true } },
  {
    ignores: [
      ".svelte-kit/",
      ".vercel/", // adapter-vercel output dir
      ".vercel_build_output/", // old output dir
      "static/",
      "build/",
      "dist/",
      "coverage/", // vitest coverage
      "vitest.config.ts.timestamp*", // vite temp files
      "node_modules/"
    ]
  }
];