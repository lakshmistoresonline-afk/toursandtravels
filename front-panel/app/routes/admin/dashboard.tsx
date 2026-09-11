import { useLoaderData, Link } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Users, MapPin, ClipboardList, ArrowRight, Calendar, User, IndianRupee, Compass } from "lucide-react";
import { collection, getDocs, limit, query, orderBy } from "firebase/firestore";
import { db } from "@workspace/shared/lib/firebase";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";

export const clientLoader = async () => {
	try {
		const usersSnap = await getDocs(collection(db, "users"));
		const toursSnap = await getDocs(collection(db, "tours"));
		const regsSnap = await getDocs(collection(db, "registrations"));

		// Fetch recent registrations
		const recentRegsQuery = query(
			collection(db, "registrations"),
			orderBy("createdAt", "desc"),
			limit(5),
		);
		const recentRegsSnap = await getDocs(recentRegsQuery);
		const recentRegistrations = recentRegsSnap.docs.map((doc) => ({
			id: doc.id,
			...doc.data(),
		}));

		return {
			stats: {
				users: usersSnap.size,
				tours: toursSnap.size,
				registrations: regsSnap.size,
			},
			recentRegistrations,
		};
	} catch (error) {
		console.error("Dashboard loader error:", error);
		return { stats: { users: 0, tours: 0, registrations: 0 }, recentRegistrations: [] };
	}
};

export default function AdminDashboard() {
	const { stats, recentRegistrations } = useLoaderData<any>();

	const cards = [
		{
			title: "Total Pilgrims",
			value: stats.users,
			icon: Users,
			color: "text-blue-600",
			bgColor: "bg-blue-50",
			link: "/admin/registrations",
		},
		{
			title: "Active Journeys",
			value: stats.tours,
			icon: MapPin,
			color: "text-primary",
			bgColor: "bg-primary/5",
			link: "/admin/tours",
		},
		{
			title: "New Registrations",
			value: stats.registrations,
			icon: ClipboardList,
			color: "text-emerald-600",
			bgColor: "bg-emerald-50",
			link: "/admin/registrations",
		},
	];

	return (
		<div className="space-y-12 animate-in fade-in duration-700 max-w-7xl mx-auto">
			<MetaDetails
				metaTitle="Admin Dashboard | AMBADY"
				metaDescription="Overview of sacred paths and pilgrims."
			/>

			<div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-primary/10 pb-8">
				<div className="space-y-2">
					<h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">
						Pilgrimage Management
					</h4>
					<h1 className="text-5xl font-serif text-foreground tracking-tight leading-tight">
						Admin Overview
					</h1>
					<p className="text-foreground/40 text-xs font-sans uppercase tracking-[0.1em] font-medium leading-relaxed">
						Overseeing sacred paths and spiritual journeys.
					</p>
				</div>
				<Button
					asChild
					className="rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-[10px] px-8 h-12 hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
				>
					<Link to="/admin/tours/add" prefetch="intent" viewTransition>
						+ Add New Journey
					</Link>
				</Button>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{cards.map((card) => (
					<div
						key={card.title}
						className="bg-card rounded-[2.5rem] overflow-hidden group hover:border-primary/30 border border-primary/10 transition-all duration-500 shadow-sm"
					>
						<div className="p-10 flex items-center justify-between">
							<div className="space-y-3">
								<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em]">
									{card.title}
								</p>
								<p className="text-5xl font-serif text-foreground tracking-tight">
									{card.value}
								</p>
							</div>
							<div
								className={`p-6 rounded-2xl ${card.bgColor} ${card.color} border border-primary/5`}
							>
								<card.icon className="h-8 w-8" />
							</div>
						</div>
						<div className="px-10 pb-6 pt-4 border-t border-primary/5">
							<Link
								to={card.link}
								prefetch="intent"
								viewTransition
								className="text-[10px] font-bold text-primary uppercase tracking-[0.2em] hover:text-foreground transition-colors flex items-center gap-2"
							>
								View Details <ArrowRight className="h-3.5 w-3.5" />
							</Link>
						</div>
					</div>
				))}
			</div>

			<div className="grid lg:grid-cols-3 gap-12">
				{/* Recent Activity */}
				<div className="lg:col-span-2 bg-card rounded-[2.5rem] overflow-hidden shadow-sm border border-primary/10">
					<div className="px-10 py-7 border-b border-primary/10 flex flex-row items-center justify-between bg-primary/5">
						<div className="flex items-center gap-4">
							<Calendar className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground">
								Recent Pilgrim Registrations
							</h3>
						</div>
						<Link
							to="/admin/registrations"
							className="text-[9px] font-bold text-primary uppercase tracking-widest hover:text-foreground"
						>
							View All
						</Link>
					</div>
					<div className="p-0">
						{recentRegistrations.length > 0 ? (
							<div className="divide-y divide-primary/5">
								{recentRegistrations.map((reg: any) => (
									<div
										key={reg.id}
										className="p-8 flex flex-wrap items-center justify-between hover:bg-primary/5 transition-all duration-300 gap-6"
									>
										<div className="flex items-center gap-6">
											<div className="h-12 w-12 rounded-full bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
												<User className="h-6 w-6" />
											</div>
											<div className="space-y-1">
												<p className="font-serif text-foreground text-xl">
													{(reg as any).profileSnapshot?.first_name}{" "}
													{(reg as any).profileSnapshot?.last_name}
												</p>
												<p className="text-[10px] text-foreground/50 font-bold uppercase tracking-widest">
													{(reg as any).tours?.name}
												</p>
											</div>
										</div>
										<div className="text-right space-y-2">
											<div className="flex items-center gap-1 text-primary font-serif text-xl justify-end">
												<IndianRupee className="h-4 w-4" />
												{(
													(reg as any).tours?.price * (reg as any).travellersCount
												).toLocaleString()}
											</div>
											<Badge
												className={`text-[9px] uppercase tracking-widest border shadow-sm font-bold px-4 py-1.5 rounded-full ${reg.status === "CONFIRMED" ? "text-emerald-600 border-emerald-500/20 bg-emerald-50" : "text-primary border-primary/20 bg-primary/5"}`}
											>
												{(reg as any).status}
											</Badge>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="p-32 text-center space-y-6">
								<div className="h-20 w-20 rounded-full bg-primary/5 border border-dashed border-primary/20 flex items-center justify-center mx-auto text-primary/20">
									<Compass className="h-10 w-10" />
								</div>
								<p className="text-foreground/30 font-serif italic text-2xl tracking-widest">
									No recent registrations.
								</p>
							</div>
						)}
					</div>
				</div>

				{/* Quick Stats / Actions */}
				<div className="space-y-8">
					<div className="bg-card rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-8 shadow-sm border border-primary/10">
						<div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
							<MapPin className="h-10 w-10" />
						</div>
						<div className="space-y-3">
							<p className="text-foreground font-serif text-2xl tracking-tight">
								Active Journeys
							</p>
							<p className="text-[10px] text-foreground/50 font-bold uppercase tracking-[0.2em] leading-loose">
								Initiate new sacred paths and pilgrimage experiences for your community.
							</p>
						</div>
						<Button
							asChild
							className="w-full rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-[0.2em] text-[10px] h-14 hover:bg-primary/90 transition-all shadow-xl shadow-primary/20"
						>
							<Link to="/admin/tours/add" prefetch="intent" viewTransition>
								Initiate Journey
							</Link>
						</Button>
					</div>
				</div>
			</div>
		</div>
	);
}
