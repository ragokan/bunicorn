import { defineConfig, build } from "tsup";

const globalConfig = defineConfig({
  entry: ["./src/index.ts"],
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
  env: { IS_BUN: false }
});

await build(globalConfig);
console.log("Build of client is completed!");
