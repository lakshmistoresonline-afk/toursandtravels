import { type LoaderFunctionArgs, Outlet, redirect } from "react-router";
import { Card, CardContent } from "~/components/ui/card";
import { NavLink } from "react-router";
import { User, Calendar, ShieldCheck, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user) return redirect("/login");
	return null;
};

export default function AccountLayout() {
	const navItems = [
		{ to: "/account/details", label: "Pilgrim Profile", icon: User },
		{ to: "/account/bookings", label: "My Pilgrimage Journeys", icon: Calendar },
	];

	return (
		<div className="container mx-auto py-20 px-4 animate-in fade-in duration-1000">
			<div className="grid gap-16 lg:grid-cols-[320px_1fr]">
				<aside className="space-y-10">
					<div className="px-4 space-y-4">
						<h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37]">Personal</h4>
						<h1 className="text-5xl font-serif text-[#fdfcf0] tracking-tight">Pilgrim Hub</h1>
						<p className="text-[#fdfcf0]/40 text-sm font-sans font-light uppercase tracking-widest leading-relaxed">Manage your sacred data and journey history.</p>
					</div>

					<Card className="glass-card border border-[#d4af37]/10 rounded-[2.5rem] overflow-hidden">
						<CardContent className="p-3">
							<nav className="flex flex-col gap-2">
								{navItems.map((item) => (
									<NavLink
										key={item.to}
										to={item.to}
										className={({ isActive }) =>
											`flex items-center justify-between px-6 py-5 rounded-[1.5rem] transition-all font-bold text-[10px] uppercase tracking-[0.2em] ${
												isActive
													? "bg-[#d4af37] text-[#0a0e1a] shadow-lg shadow-[#d4af37]/20"
													: "text-[#fdfcf0]/60 hover:bg-white/5 hover:text-[#fdfcf0]"
											}`
										}
									>
										<div className="flex items-center gap-4">
											<item.icon className="w-4 h-4" />
											{item.label}
										</div>
										<ChevronRight className="w-3.5 h-3.5 opacity-30" />
									</NavLink>
								))}
							</nav>
						</CardContent>
					</Card>

					<div className="p-8 rounded-[2rem] bg-[#d4af37]/5 border border-[#d4af37]/10 space-y-4 shadow-xl">
						<ShieldCheck className="h-10 w-10 text-[#d4af37]" />
						<div className="space-y-2">
							<p className="font-bold text-[#fdfcf0] text-[10px] uppercase tracking-widest">Profile Verified</p>
							<p className="text-xs text-[#fdfcf0]/40 leading-relaxed font-light">Your sacred journey data is stored securely in our private cloud.</p>
						</div>
					</div>
				</aside>

				<main className="min-h-[600px]">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
