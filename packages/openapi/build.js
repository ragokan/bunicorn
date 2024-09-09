await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	minify: true,
	splitting: true,
	sourcemap: "external",
	target: "bun",
	define: {
		IS_BUN: "true",
	},
});

console.log("Build of openapi is completed!");
