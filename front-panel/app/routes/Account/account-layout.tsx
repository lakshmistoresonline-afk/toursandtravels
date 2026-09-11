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
		{ to: "/account/bookings", label: "My Journeys", icon: Calendar },
	];

	return (
		<div className="container mx-auto py-24 px-6 animate-in fade-in duration-1000 bg-background">
			<div className="grid gap-20 lg:grid-cols-[340px_1fr]">
				<aside className="space-y-12">
					<div className="px-4 space-y-4">
						<h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary">
							Personal
						</h4>
						<h1 className="text-5xl font-serif text-foreground tracking-tight leading-tight">
							Pilgrim Hub
						</h1>
						<p className="text-foreground/40 text-sm font-sans uppercase tracking-[0.1em] font-medium leading-relaxed">
							Manage your sacred data and journey history.
						</p>
					</div>

					<Card className="bg-card border border-primary/10 rounded-[2.5rem] overflow-hidden shadow-xl">
						<CardContent className="p-4">
							<nav className="flex flex-col gap-3">
								{navItems.map((item) => (
									<NavLink
										key={item.to}
										to={item.to}
										className={({ isActive }) =>
											`flex items-center justify-between px-7 py-5 rounded-[1.8rem] transition-all font-bold text-[10px] uppercase tracking-[0.2em] ${
												isActive
													? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
													: "text-foreground/60 hover:bg-primary/5 hover:text-primary"
											}`
										}
									>
										<div className="flex items-center gap-4">
											<item.icon className="w-4.5 h-4.5" />
											{item.label}
										</div>
										<ChevronRight className="w-4 h-4 opacity-30" />
									</NavLink>
								))}
							</nav>
						</CardContent>
					</Card>

					<div className="p-10 rounded-[2.5rem] bg-primary/5 border border-primary/10 space-y-6 shadow-sm">
						<ShieldCheck className="h-10 w-10 text-primary" />
						<div className="space-y-3">
							<p className="font-bold text-foreground text-[11px] uppercase tracking-widest">
								Profile Secured
							</p>
							<p className="text-xs text-foreground/50 leading-loose font-medium">
								Your sacred journey data is stored securely in our private pilgrimage network.
							</p>
						</div>
					</div>
				</aside>

				<main className="min-h-[700px]">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
