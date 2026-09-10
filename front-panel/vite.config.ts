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
		],
		resolve: {
			alias: {
				"~": path.resolve(__dirname, "./app"),
				"@workspace/shared": path.resolve(__dirname, "../shared/src"),
				"@tabler/icons-react": "@tabler/icons-react/dist/esm/icons/index.mjs",
			},
		},
		optimizeDeps: {
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
			warmup: {
				clientFiles: ["./app/root.tsx", "./app/entry.client.tsx"],
			},
		},
	};
});
