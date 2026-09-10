import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import viteCompression from "vite-plugin-compression";

export default defineConfig(({ mode }) => {
	const env = loadEnv(mode, path.resolve(__dirname, "../"));

	return {
		plugins: [
			tailwindcss(),
			reactRouter(),
			tsconfigPaths({
				projects: [
					path.resolve(__dirname, "tsconfig.json"),
					path.resolve(__dirname, "../shared/tsconfig.json"),
				],
			}),
			viteCompression({
				verbose: true,
				disable: false,
				algorithm: "brotliCompress",
				ext: ".br",
			}),
			viteCompression({
				verbose: true,
				disable: false,
				algorithm: "gzip",
				ext: ".gz",
			}),
		],
		build: {
			reportCompressedSize: false,
			rollupOptions: {
				output: {
					manualChunks(id) {
						if (id.includes("node_modules")) {
							if (id.includes("lucide-react")) return "icons";
							if (id.includes("firebase")) return "firebase";
							if (id.includes("@radix-ui")) return "ui-core";
							return "vendor";
						}
					},
				},
			},
		},
		resolve: {
			alias: {
				"~": path.resolve(__dirname, "./app"),
				"@workspace/shared": path.resolve(__dirname, "../shared/src"),
				"@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
			},
		},
		optimizeDeps: {
			force: process.env.FORCE_OPTIMIZE === "true",
			holdUntilResolved: true,
			include: [
				"@tabler/icons-react",
				"lucide-react",
				"@radix-ui/react-dropdown-menu",
				"@radix-ui/react-tooltip",
				"@radix-ui/react-dialog",
				"firebase/app",
				"firebase/auth",
				"firebase/firestore",
				"firebase/storage",
			],
			exclude: ["@workspace/shared"],
		},
		define: {
			"process.env.VITE_FIREBASE_API_KEY": JSON.stringify(env.VITE_FIREBASE_API_KEY),
			"process.env.VITE_FIREBASE_AUTH_DOMAIN": JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
			"process.env.VITE_FIREBASE_PROJECT_ID": JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
			"process.env.VITE_FIREBASE_STORAGE_BUCKET": JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
			"process.env.VITE_FIREBASE_MESSAGING_SENDER_ID": JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
			"process.env.VITE_FIREBASE_APP_ID": JSON.stringify(env.VITE_FIREBASE_APP_ID),
			"process.env.VITE_MAIN_APP_URL": JSON.stringify(env.VITE_MAIN_APP_URL),
		},
		server: {
			port: 5175,
			// Prevent the browser from caching optimized dependencies during development
			// to avoid the 504 "Outdated Optimize Dep" error.
			headers: {
				"Cache-Control": "no-store",
			},
		},
	};
});
