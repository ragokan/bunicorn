import { defineConfig, build } from "tsup";

const config = defineConfig({
  entry: [
    "./src/index.ts",
    "./src/matchers/constants.ts",
    "./src/helpers/di.ts",
    "./src/handlers/cors.ts",
    "./src/handlers/static.ts",
    "./src/app/edgeApp.ts"
  ],
  outDir: "./dist",
  treeshake: "recommended",
  splitting: false,
  sourcemap: true,
  clean: true,
  banner: {
    js: "// Bunicorn by Ragokan"
  },
  minify: true,
  dts: true,
  format: ["cjs", "esm", "iife"],
  external: ["*"],
  silent: true,
  env: { IS_BUN: true }
});

await build(config);
console.log("Build of server is completed!");
