import { Outlet, redirect, type LoaderFunctionArgs, Link, NavLink, Form } from "react-router";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { LayoutDashboard, MapPin, ClipboardList, Globe, LogOut } from "lucide-react";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user || user.role !== "admin") {
		return redirect("/login");
	}
	return { user };
};

export default function AdminLayout() {
	return (
		<div className="admin-container min-h-screen bg-slate-50/50 flex flex-col">
			{/* Admin Header / Navigation */}
			<nav className="bg-white border-b px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
				<div className="flex items-center gap-10">
					<Link to="/admin" className="flex items-center gap-2">
						<div className="bg-primary h-8 w-8 rounded-lg flex items-center justify-center">
							<span className="text-white font-bold">W</span>
						</div>
						<h2 className="font-bold text-xl tracking-tight hidden sm:block">Ambady Tours and Travels Admin</h2>
					</Link>

					<div className="flex items-center gap-6">
						<NavLink
							to="/admin"
							end
							className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`}
						>
							<LayoutDashboard className="h-4 w-4" />
							<span className="hidden lg:inline">Dashboard</span>
						</NavLink>
						<NavLink
							to="/admin/tours"
							className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`}
						>
							<MapPin className="h-4 w-4" />
							<span className="hidden lg:inline">Manage Tours</span>
						</NavLink>
						<NavLink
							to="/admin/registrations"
							className={({ isActive }) => `flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"}`}
						>
							<ClipboardList className="h-4 w-4" />
							<span className="hidden lg:inline">Registrations</span>
						</NavLink>
					</div>
				</div>

				<div className="flex items-center gap-6">
					<Link to="/" className="text-sm font-medium flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors">
						<Globe className="h-4 w-4" />
						<span className="hidden sm:inline">View Site</span>
					</Link>
					<Separator orientation="vertical" className="h-6" />
					<Form action="/logout" method="POST">
						<button type="submit" className="text-sm font-medium text-destructive flex items-center gap-2 hover:opacity-80 transition-opacity cursor-pointer">
							<LogOut className="h-4 w-4" />
							<span className="hidden sm:inline">Logout</span>
						</button>
					</Form>
				</div>
			</nav>

			{/* Content Area */}
			<main className="p-8 flex-1 container mx-auto">
				<Outlet />
			</main>
		</div>
	);
}

function Separator({ orientation = "horizontal", className = "" }) {
	return <div className={`bg-border ${orientation === "horizontal" ? "h-[1px] w-full" : "w-[1px] h-full"} ${className}`} />;
}
