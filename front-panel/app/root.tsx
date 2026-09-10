import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import type { Route } from "./+types/root";
import "./app.css";
import ErrorPage from "~/components/Error/ErrorPage";
import { TopLoadingBar } from "~/components/Loaders/TopLoadingBar";
import { Toaster } from "~/components/ui/sonner";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { Loader2 } from "lucide-react";

export const links: Route.LinksFunction = () => [
	{ rel: "preconnect", href: "https://fonts.googleapis.com" },
	{
		rel: "preconnect",
		href: "https://fonts.gstatic.com",
		crossOrigin: "anonymous",
	},
	{
		rel: "stylesheet",
		href: "https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Inter:wght@300;400;600&family=Playfair+Display:ital,wght@0,400;0,700;1,400&display=swap",
	},
];

export async function clientLoader({ request }: Route.ClientLoaderArgs) {
	try {
		const { user } = await getCurrentUser(request);
		return { user };
	} catch (error) {
		return { user: null };
	}
}

export function HydrateFallback() {
	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<Loader2 className="h-10 w-10 animate-spin text-[#d4af37]" />
		</div>
	);
}

export function Layout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning={true}>
			<head>
				<meta charSet="utf-8" />
				<meta name="viewport" content="width=device-width, initial-scale=1" />
				<link rel="icon" href="/favicon-48x.png" type="image/png" />
				<Meta />
				<Links />
			</head>
			<body className="min-h-screen font-sans antialiased selection:bg-[#d4af37] selection:text-white" data-gramm="false" spellCheck="false">
				{children}
				<ScrollRestoration />
				<Scripts />
			</body>
		</html>
	);
}

export default function App() {
	return (
		<>
			{/* Persistent Brand Background Layer */}
			<div className="ambady-bg-layer">
				<img
					src="/brand/ambady-background.png"
					alt="Ambady Background"
					className="w-full h-full object-cover"
					loading="eager"
					decoding="sync"
				/>
			</div>
			<div className="ambady-bg-overlay" />

			<TopLoadingBar />
			<div className="ambady-content-wrapper">
				<Outlet />
			</div>
			<Toaster position="top-center" expand={false} richColors />
		</>
	);
}

export function ErrorBoundary() {
	return <ErrorPage />;
}
