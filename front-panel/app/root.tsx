import { Outlet, ScrollRestoration, isRouteErrorResponse, useRouteError } from "react-router";
import "./app.css";
import { Toaster } from "~/components/ui/sonner";
import { Loader2, AlertCircle, Home } from "lucide-react";
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
	const error = useRouteError();

	let title = "Sacred Connection Lost";
	let message = "The path you were seeking has vanished or encountered a temporary disturbance.";
	let icon = <AlertCircle className="h-16 w-16 text-[#d4af37]/50 mb-6" />;

	if (isRouteErrorResponse(error)) {
		if (error.status === 404) {
			title = "Destination Not Found";
			message = "The pilgrimage path you seek is currently beyond our sacred map.";
		} else {
			title = `Encountered a ${error.status} Disturbance`;
			message = error.data?.message || "An unexpected disturbance occurred on our path.";
		}
	} else if (error instanceof Error) {
		console.error("Path Disturbance:", error);
		if (error.message.includes("index")) {
			message = "We are currently optimizing our sacred records. Please try again in a few moments.";
		}
	}

	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center bg-[#0a0e1a] p-6 text-center text-[#fdfcf0]">
			<div className="max-w-md animate-in fade-in zoom-in-95 duration-500">
				{icon}
				<h1 className="text-4xl md:text-5xl font-serif mb-4 tracking-tight">{title}</h1>
				<div className="w-16 h-0.5 bg-[#d4af37]/40 mx-auto rounded-full mb-6" />
				<p className="text-[#fdfcf0]/50 mb-10 text-sm font-medium leading-relaxed">{message}</p>
				<div className="flex flex-col sm:flex-row gap-4 justify-center">
					<button
						onClick={() => window.location.reload()}
						className="px-8 py-4 border border-[#d4af37]/30 text-[#d4af37] rounded-full font-bold uppercase tracking-widest text-[10px] hover:bg-[#d4af37]/5 transition-all"
					>
						Try Refreshing
					</button>
					<a
						href="/"
						className="px-8 py-4 bg-[#d4af37] text-[#0a0e1a] rounded-full font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-[#d4af37]/10 hover:scale-105 transition-all flex items-center justify-center gap-2"
					>
						<Home className="h-3.5 w-3.5" /> Return Home
					</a>
				</div>
			</div>

			{/* Hidden technical details for developers - can be toggled or viewed in console */}
			{process.env.NODE_ENV === "development" && (
				<div className="mt-20 opacity-10 hover:opacity-100 transition-opacity max-w-4xl text-left overflow-auto p-4 bg-black/50 rounded-xl border border-white/10">
					<p className="text-[10px] font-mono text-red-400 mb-2">Developer Debug Info:</p>
					<pre className="text-[9px] font-mono text-white/40">
						{error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
}
