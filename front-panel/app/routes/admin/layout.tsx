import {
	Outlet,
	redirect,
	type LoaderFunctionArgs,
	Link,
	NavLink,
	Form,
	useRouteError,
	isRouteErrorResponse,
} from "react-router";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import {
	LayoutDashboard,
	MapPin,
	ClipboardList,
	Globe,
	LogOut,
	Compass,
	Users,
	AlertTriangle,
	RefreshCw,
} from "lucide-react";
import { Button } from "~/components/ui/button";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user || user.role !== "admin") {
		return redirect("/login");
	}
	return { user };
};

export default function AdminLayout() {
	return (
		<div className="min-h-screen flex flex-col bg-background">
			{/* Admin Header / Navigation */}
			<nav className="bg-[#0a0e1a] border-b border-[#d4af37]/30 px-8 py-3 flex justify-between items-center sticky top-0 z-50 shadow-lg">
				<div className="flex items-center gap-12">
					<Link to="/admin" className="flex items-center gap-3 group">
						<div className="h-9 w-9 rounded-full bg-white/5 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] transition-transform duration-500 group-hover:rotate-12">
							<Compass className="h-5 w-5" />
						</div>
						<div className="flex flex-col leading-none">
							<span className="text-xl font-display font-bold tracking-widest text-[#d4af37]">
								AMBADY
							</span>
							<span className="text-[7px] font-bold text-[#fdfcf0]/50 uppercase tracking-[0.3em] mt-0.5">
								Pilgrimage Management
							</span>
						</div>
					</Link>

					<div className="flex items-center gap-2">
						<NavLink
							to="/admin"
							end
							prefetch="intent"
							viewTransition
							className={({ isActive }) =>
								`flex items-center gap-2.5 px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${isActive ? "bg-[#d4af37] text-[#0a0e1a]" : "text-[#fdfcf0]/60 hover:text-[#fdfcf0] hover:bg-white/5"}`
							}
						>
							<LayoutDashboard className="h-3.5 w-3.5" />
							<span className="hidden lg:inline">Dashboard</span>
						</NavLink>
						<NavLink
							to="/admin/tours"
							prefetch="intent"
							viewTransition
							className={({ isActive }) =>
								`flex items-center gap-2.5 px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${isActive ? "bg-[#d4af37] text-[#0a0e1a]" : "text-[#fdfcf0]/60 hover:text-[#fdfcf0] hover:bg-white/5"}`
							}
						>
							<MapPin className="h-3.5 w-3.5" />
							<span className="hidden lg:inline">Journeys</span>
						</NavLink>
						<NavLink
							to="/admin/registrations"
							prefetch="intent"
							viewTransition
							className={({ isActive }) =>
								`flex items-center gap-2.5 px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${isActive ? "bg-[#d4af37] text-[#0a0e1a]" : "text-[#fdfcf0]/60 hover:text-[#fdfcf0] hover:bg-white/5"}`
							}
						>
							<ClipboardList className="h-3.5 w-3.5" />
							<span className="hidden lg:inline">Registrations</span>
						</NavLink>
						<NavLink
							to="/admin/users"
							prefetch="intent"
							viewTransition
							className={({ isActive }) =>
								`flex items-center gap-2.5 px-5 py-2 rounded-lg text-[9px] font-bold uppercase tracking-[0.15em] transition-all ${isActive ? "bg-[#d4af37] text-[#0a0e1a]" : "text-[#fdfcf0]/60 hover:text-[#fdfcf0] hover:bg-white/5"}`
							}
						>
							<Users className="h-3.5 w-3.5" />
							<span className="hidden lg:inline">Pilgrims</span>
						</NavLink>
					</div>
				</div>

				<div className="flex items-center gap-6">
					<Link
						to="/"
						className="text-[9px] font-bold uppercase tracking-[0.15em] flex items-center gap-2 text-[#fdfcf0]/50 hover:text-[#d4af37] transition-all group"
					>
						<Globe className="h-3.5 w-3.5" />
						<span className="hidden sm:inline">Public Portal</span>
					</Link>
					<div className="h-6 w-[1px] bg-white/10" />
					<Form action="/logout" method="POST">
						<button
							type="submit"
							className="text-[9px] font-bold uppercase tracking-[0.15em] text-red-400/70 flex items-center gap-2 hover:text-red-400 transition-all cursor-pointer"
						>
							<LogOut className="h-3.5 w-3.5" />
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

export function ErrorBoundary() {
	const error = useRouteError();

	let message = "An unexpected disturbance occurred while managing the sacred map.";
	if (isRouteErrorResponse(error)) {
		message = error.data?.message || message;
	} else if (error instanceof Error) {
		if (error.message.includes("index")) {
			message =
				"The management records are currently being optimized. Please try refreshing in a few moments.";
		} else {
			message = error.message;
		}
	}

	return (
		<div className="h-[60vh] flex flex-col items-center justify-center text-center p-12 bg-red-50/30 rounded-[3rem] border border-red-100 border-dashed animate-in fade-in duration-500">
			<div className="h-20 w-20 rounded-full bg-red-100 flex items-center justify-center text-red-600 mb-8">
				<AlertTriangle className="h-10 w-10" />
			</div>
			<h2 className="text-2xl font-serif text-foreground mb-4">Management Portal Disturbance</h2>
			<p className="text-foreground/50 max-w-md mb-10 text-sm font-medium leading-relaxed">
				{message}
			</p>
			<Button
				onClick={() => window.location.reload()}
				variant="outline"
				className="rounded-full px-10 h-14 border-red-200 text-red-600 hover:bg-red-50 font-bold uppercase tracking-widest text-[10px]"
			>
				<RefreshCw className="mr-2 h-4 w-4" /> Resolve Disturbance
			</Button>
		</div>
	);
}
