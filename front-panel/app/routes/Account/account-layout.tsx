import { type LoaderFunctionArgs, Outlet, redirect } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link, NavLink } from "react-router";
import { User, Calendar, ShieldCheck, ChevronRight } from "lucide-react";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user) return redirect("/login");
	return null;
};

export default function AccountLayout() {
	const navItems = [
		{ to: "/account/details", label: "Account Profile", icon: User },
		{ to: "/account/bookings", label: "My Registrations", icon: Calendar },
	];

	return (
		<div className="container mx-auto py-12 px-4 animate-in fade-in duration-500">
			<div className="grid gap-12 lg:grid-cols-[280px_1fr]">
				<aside className="space-y-6">
					<div className="px-4">
						<h1 className="text-3xl font-black text-slate-900 tracking-tight">Settings</h1>
						<p className="text-slate-500 mt-2 text-sm">Manage your personal data and tour history.</p>
					</div>

					<Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-slate-50/50">
						<CardContent className="p-2">
							<nav className="flex flex-col gap-1">
								{navItems.map((item) => (
									<NavLink
										key={item.to}
										to={item.to}
										className={({ isActive }) =>
											`flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold text-sm ${
												isActive
													? "bg-white text-primary shadow-sm ring-1 ring-slate-100"
													: "text-slate-500 hover:bg-white hover:text-slate-900"
											}`
										}
									>
										<div className="flex items-center gap-3">
											<item.icon className="w-5 h-5" />
											{item.label}
										</div>
										<ChevronRight className="w-4 h-4 opacity-30" />
									</NavLink>
								))}
							</nav>
						</CardContent>
					</Card>

					<div className="p-6 rounded-3xl bg-primary/5 border border-primary/10 space-y-3">
						<ShieldCheck className="h-8 w-8 text-primary" />
						<p className="font-bold text-slate-900 text-sm">Profile Verified</p>
						<p className="text-xs text-slate-500 leading-relaxed">Your data is stored securely in our private Firebase cloud.</p>
					</div>
				</aside>

				<main className="min-h-[600px]">
					<Outlet />
				</main>
			</div>
		</div>
	);
}
