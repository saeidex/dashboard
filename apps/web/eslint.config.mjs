import createConfig from "@crm/eslint-config/create-config";
import pluginQuery from "@tanstack/eslint-plugin-query";
import pluginRouter from "@tanstack/eslint-plugin-router";

export default createConfig({
  react: true,
  ignores: ["src/routeTree.gen.ts", "src/components/ui/*"],
}, {
  plugins: {
    "@tanstack/query": pluginQuery,
    "@tanstack/router": pluginRouter,
  },
  rules: {
    "antfu/top-level-function": "off",
    "@tanstack/query/exhaustive-deps": "error",
    "unicorn/filename-case": ["error", {
      case: "kebabCase",
      ignore: ["README.md", "~__root.tsx"],
    }],
  },
}, ...pluginRouter.configs["flat/recommended"], {
  files: ["**/features/**/data/*.{ts,tsx}"],
  rules: {
    "style/key-spacing": ["error", {
      align: "colon",
    }],
  },
});
