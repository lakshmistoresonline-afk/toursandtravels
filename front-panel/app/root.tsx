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
		href: "https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000&display=swap",
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
			<Loader2 className="h-10 w-10 animate-spin text-primary" />
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
			<body>
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
			<TopLoadingBar />
			<Outlet />
			<Toaster />
		</>
	);
}

export function ErrorBoundary() {
	return <ErrorPage />;
}
