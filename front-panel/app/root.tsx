import { Outlet, ScrollRestoration } from "react-router";
import "./app.css";
import ErrorPage from "~/components/Error/ErrorPage";
import { TopLoadingBar } from "~/components/Loaders/TopLoadingBar";
import { Toaster } from "~/components/ui/sonner";
import { Loader2 } from "lucide-react";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export const clientLoader = async ({ request }: { request: Request }) => {
	const { user } = await getCurrentUser(request);
	return { user };
};

export function HydrateFallback() {
	return (
		<div className="flex h-screen w-screen items-center justify-center">
			<Loader2 className="h-10 w-10 animate-spin text-[#d4af37]" />
		</div>
	);
}

export default function App() {
	return (
		<>
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
