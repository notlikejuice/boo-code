const esbuild = require("esbuild")

// Konfiguracja tylko dla testów - lżejsza
const testBuild = async () => {
	await esbuild.build({
		entryPoints: ["src/test/suite/index.ts"],
		bundle: true,
		outfile: "out/test/suite/index.js",
		external: ["vscode", "mocha"],
		format: "cjs",
		platform: "node",
		target: "node16",
		sourcemap: true,
		minify: false,
	})
}

testBuild().catch((err) => {
	console.error("Test build failed:", err)
	process.exit(1)
})
