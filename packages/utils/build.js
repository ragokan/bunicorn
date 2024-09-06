await Bun.build({
	entrypoints: ["./src/index.ts"],
	outdir: "./dist",
	minify: true,
	splitting: true,
	sourcemap: "external",
	target: "browser",
	define: {
		IS_BUN: "true",
	},
});

console.log("Build of utils is completed!");
