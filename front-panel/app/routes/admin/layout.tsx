import { Outlet, redirect, type LoaderFunctionArgs } from "react-router";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user || user.role !== "admin") {
		return redirect("/login");
	}
	return { user };
};

export default function AdminLayout() {
	return (
		<div className="admin-container min-h-screen bg-muted/30">
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50">
				<h2 className="font-bold text-xl">WanderNest Admin</h2>
				<div className="flex gap-4">
					<a href="/" className="text-sm hover:underline">View Site</a>
					<a href="/logout" className="text-sm text-destructive hover:underline">Logout</a>
				</div>
			</nav>
			<main className="p-8">
				<Outlet />
			</main>
		</div>
	);
}
