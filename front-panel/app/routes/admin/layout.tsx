import { Outlet, redirect, type LoaderFunctionArgs, Link, NavLink, Form } from "react-router";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { LayoutDashboard, MapPin, ClipboardList, Globe, LogOut } from "lucide-react";

const logo = "/brand/ambady-logo.png";

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
			<nav className="bg-[#0a0e1a]/90 backdrop-blur-2xl border-b border-[#d4af37]/20 px-8 py-4 flex justify-between items-center sticky top-0 z-50 shadow-2xl">
				<div className="flex items-center gap-12">
					<Link to="/admin" className="flex items-center gap-4 group">
						<div className="h-12 w-12 transition-transform duration-500 group-hover:scale-110">
							<img src={logo} alt="Ambady Logo" className="h-full w-full object-contain drop-shadow-[0_0_8px_rgba(212,175,55,0.4)]" />
						</div>
						<div className="flex flex-col leading-none">
							<span className="text-2xl font-display font-bold tracking-widest text-[#d4af37]">AMBADY</span>
							<span className="text-[8px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em] mt-1">Admin Sanctuary</span>
						</div>
					</Link>

					<div className="flex items-center gap-4">
						<NavLink
							to="/admin"
							end
							prefetch="intent"
							viewTransition
							className={({ isActive }) => `flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isActive ? "bg-[#d4af37] text-[#0a0e1a] shadow-lg shadow-[#d4af37]/20" : "text-[#fdfcf0]/40 hover:bg-white/5 hover:text-[#fdfcf0]"}`}
						>
							<LayoutDashboard className="h-4 w-4" />
							<span className="hidden lg:inline">Dashboard</span>
						</NavLink>
						<NavLink
							to="/admin/tours"
							prefetch="intent"
							viewTransition
							className={({ isActive }) => `flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isActive ? "bg-[#d4af37] text-[#0a0e1a] shadow-lg shadow-[#d4af37]/20" : "text-[#fdfcf0]/40 hover:bg-white/5 hover:text-[#fdfcf0]"}`}
						>
							<MapPin className="h-4 w-4" />
							<span className="hidden lg:inline">Journeys</span>
						</NavLink>
						<NavLink
							to="/admin/registrations"
							prefetch="intent"
							viewTransition
							className={({ isActive }) => `flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${isActive ? "bg-[#d4af37] text-[#0a0e1a] shadow-lg shadow-[#d4af37]/20" : "text-[#fdfcf0]/40 hover:bg-white/5 hover:text-[#fdfcf0]"}`}
						>
							<ClipboardList className="h-4 w-4" />
							<span className="hidden lg:inline">Pilgrims</span>
						</NavLink>
					</div>
				</div>

				<div className="flex items-center gap-8">
					<Link to="/" className="text-[9px] font-bold uppercase tracking-[0.2em] flex items-center gap-3 text-[#fdfcf0]/40 hover:text-[#d4af37] transition-all">
						<Globe className="h-4 w-4" />
						<span className="hidden sm:inline">Portal Sight</span>
					</Link>
					<div className="h-8 w-[1px] bg-white/10" />
					<Form action="/logout" method="POST">
						<button type="submit" className="text-[9px] font-bold uppercase tracking-[0.2em] text-red-400/60 flex items-center gap-3 hover:text-red-400 transition-all cursor-pointer">
							<LogOut className="h-4 w-4" />
							<span className="hidden sm:inline">Depart</span>
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
