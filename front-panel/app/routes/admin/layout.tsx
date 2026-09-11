import { Outlet, redirect, type LoaderFunctionArgs, Link, NavLink, Form } from "react-router";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { LayoutDashboard, MapPin, ClipboardList, Globe, LogOut, Compass } from "lucide-react";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user || user.role !== "admin") {
		return redirect("/login");
	}
	return { user };
};

export default function AdminLayout() {
	return (
		<div className="admin-container min-h-screen flex flex-col">
			{/* Admin Header / Navigation */}
			<nav className="bg-[#0a0e1a]/95 backdrop-blur-2xl border-b border-[#d4af37]/30 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
				<div className="flex items-center gap-12">
					<Link to="/admin" className="flex items-center gap-4 group">
						<div className="h-10 w-10 rounded-full bg-black/40 border border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] shadow-[0_0_15px_rgba(212,175,55,0.3)] transition-transform duration-500 group-hover:scale-110">
							<Compass className="h-5 w-5" />
						</div>
						<div className="flex flex-col leading-none">
							<span className="text-2xl font-display font-bold tracking-widest text-[#d4af37]">AMBADY</span>
							<span className="text-[8px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.3em] mt-1">Admin Sanctuary</span>
						</div>
					</Link>

					<div className="flex items-center gap-4">
						<NavLink
							to="/admin"
							end
							prefetch="intent"
							viewTransition
							className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${isActive ? "bg-[#d4af37] text-[#0a0e1a] border-[#d4af37] shadow-lg shadow-[#d4af37]/20" : "text-[#fdfcf0]/60 border-white/10 hover:bg-white/5 hover:text-[#fdfcf0] hover:border-[#d4af37]/40"}`}
						>
							<LayoutDashboard className="h-4 w-4" />
							<span className="hidden lg:inline">Dashboard</span>
						</NavLink>
						<NavLink
							to="/admin/tours"
							prefetch="intent"
							viewTransition
							className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${isActive ? "bg-[#d4af37] text-[#0a0e1a] border-[#d4af37] shadow-lg shadow-[#d4af37]/20" : "text-[#fdfcf0]/60 border-white/10 hover:bg-white/5 hover:text-[#fdfcf0] hover:border-[#d4af37]/40"}`}
						>
							<MapPin className="h-4 w-4" />
							<span className="hidden lg:inline">Journeys</span>
						</NavLink>
						<NavLink
							to="/admin/registrations"
							prefetch="intent"
							viewTransition
							className={({ isActive }) => `flex items-center gap-3 px-6 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${isActive ? "bg-[#d4af37] text-[#0a0e1a] border-[#d4af37] shadow-lg shadow-[#d4af37]/20" : "text-[#fdfcf0]/60 border-white/10 hover:bg-white/5 hover:text-[#fdfcf0] hover:border-[#d4af37]/40"}`}
						>
							<ClipboardList className="h-4 w-4" />
							<span className="hidden lg:inline">Pilgrims</span>
						</NavLink>
					</div>
				</div>

				<div className="flex items-center gap-8">
					<Link to="/" className="text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 text-[#fdfcf0]/60 hover:text-[#d4af37] transition-all group">
						<Globe className="h-4 w-4 group-hover:rotate-12 transition-transform" />
						<span className="hidden sm:inline border-b border-transparent group-hover:border-[#d4af37]/40 pb-0.5">Portal Sight</span>
					</Link>
					<div className="h-8 w-[1px] bg-white/10" />
					<Form action="/logout" method="POST">
						<button type="submit" className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-400/80 flex items-center gap-3 hover:text-red-400 transition-all cursor-pointer group">
							<LogOut className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
							<span className="hidden sm:inline border-b border-transparent group-hover:border-red-400/40 pb-0.5">Depart</span>
						</button>
					</Form>
				</div>
			</nav>

			{/* Content Area */}
			<main className="p-10 flex-1 container mx-auto relative z-10">
				<Outlet />
			</main>
		</div>
	);
}
