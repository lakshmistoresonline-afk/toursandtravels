import { defineConfig, loadEnv } from "@rsbuild/core";
import { pluginReact } from "@rsbuild/plugin-react";
import { pluginTailwindcss } from "@rsbuild/plugin-tailwindcss";
import path from "path";

const { publicVars, rawPublicVars } = loadEnv({
	cwd: path.resolve(__dirname, "../"),
	prefixes: ["VITE_"],
});

// Load variables into process.env for build-time access
Object.assign(process.env, rawPublicVars);

export default defineConfig({
	plugins: [pluginReact(), pluginTailwindcss()],
	source: {
		entry: {
			index: "./app/main.tsx",
		},
		alias: {
			"~": path.resolve(__dirname, "./app"),
			"@workspace/shared": path.resolve(__dirname, "../shared/src"),
		},
		define: publicVars,
	},
	server: {
		port: 5175,
		historyApiFallback: true,
		headers: {
			"Cache-Control": "no-store",
		},
	},
	output: {
		distPath: {
			root: "dist",
		},
		cleanDistPath: true,
	},
	html: {
		template: "./public/index.html",
	},
});
