await Bun.build({
  entrypoints: [
    "./src/index.ts",
    "./src/matchers/constants.ts",
    "./src/handlers/cors.ts",
    "./src/handlers/static.ts",
    "./src/app/edgeApp.ts"
  ],
  outdir: "./dist",
  minify: true,
  splitting: true,
  sourcemap: "external",
  target: "bun",
  define: {
    IS_BUN: "true"
  }
});

console.log("Build of server is completed!");
