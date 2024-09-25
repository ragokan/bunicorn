await Bun.build({
	entrypoints: [
		"./src/index.ts",
		"./src/matchers/constants.ts",
		"./src/handlers/cors.ts",
		"./src/handlers/static.ts",
	],
	outdir: "./dist",
	minify: true,
	splitting: true,
	sourcemap: "external",
	target: "bun",
}).then((result) => {
	if (!result.success) {
		console.error(result.logs);
		process.exit(1);
	}
});

console.log("Build of server is completed!");
