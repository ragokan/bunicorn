import { defineConfig, build } from "tsup";

const config = defineConfig({
  entry: ["./src/index.ts"],
  outDir: "dist",
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
  silent: true
});

await build(config);
console.log("Build of utils is completed!");
