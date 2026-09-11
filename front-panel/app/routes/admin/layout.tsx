import { Outlet, redirect, type LoaderFunctionArgs, Link, NavLink, Form } from "react-router";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { LayoutDashboard, MapPin, ClipboardList, Globe, LogOut, Compass, Users } from "lucide-react";

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
