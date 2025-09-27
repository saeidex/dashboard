import createConfig from "@crm/eslint-config/create-config";
import pluginQuery from "@tanstack/eslint-plugin-query";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import globals from "globals";

export default createConfig(
  {
    react: true,
    ignores: [
      "node_modules",
      "dist",
      "public",
      "**/components/ui/**",
      "src/routeTree.gen.ts",
    ],
  },
  {
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    plugins: {
      "@tanstack/query": pluginQuery,
      reactHooks,
      reactRefresh,
    },
    rules: {
      "antfu/top-level-function": "off",
      "@tanstack/query/exhaustive-deps": "error",
      "unicorn/filename-case": [
        "warn",
        {
          case: "kebabCase",
          ignore: ["README.md", "~__root.tsx"],
        },
      ],
    },
  },
);
