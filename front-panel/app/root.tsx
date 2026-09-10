import { Outlet, ScrollRestoration } from "react-router";
import "./app.css";
import ErrorPage from "~/components/Error/ErrorPage";
import { TopLoadingBar } from "~/components/Loaders/TopLoadingBar";
import { Toaster } from "~/components/ui/sonner";
import { Loader2 } from "lucide-react";

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
			<ScrollRestoration />
		</>
	);
}

export function ErrorBoundary() {
	return <ErrorPage />;
}
