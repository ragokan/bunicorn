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
}).then((result) => {
	if (!result.success) {
		console.error(result.logs);
		process.exit(1);
	}
});

console.log("Build of openapi is completed!");
