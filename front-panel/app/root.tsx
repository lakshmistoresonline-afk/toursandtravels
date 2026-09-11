import { Outlet, ScrollRestoration } from "react-router";
import "./app.css";
import { Toaster } from "~/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export const clientLoader = async ({ request }: { request: Request }) => {
	const { user } = await getCurrentUser(request);
	return { user };
};

export function HydrateFallback() {
	return (
		<div className="flex h-screen w-screen items-center justify-center bg-background">
			<Loader2 className="h-10 w-10 animate-spin text-primary" />
		</div>
	);
}

export default function App() {
	return (
		<>
			<div className="ambady-content-wrapper">
				<Outlet />
			</div>
			<Toaster position="top-center" expand={false} richColors />
			<ScrollRestoration />
		</>
	);
}

export function ErrorBoundary() {
	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-6 text-center">
			<h1 className="text-4xl font-serif text-foreground mb-4">Sacred Connection Lost</h1>
			<p className="text-foreground/60 mb-8 max-w-md">
				The path you were seeking has vanished. Please return to the home sanctuary.
			</p>
			<a
				href="/"
				className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold uppercase tracking-widest text-[10px]"
			>
				Return Home
			</a>
		</div>
	);
}
