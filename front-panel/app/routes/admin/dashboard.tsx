import { useLoaderData, Link } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, MapPin, ClipboardList, PlusCircle, ArrowRight, Calendar, User, IndianRupee } from "lucide-react";
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
		const recentRegsQuery = query(collection(db, "registrations"), orderBy("createdAt", "desc"), limit(5));
		const recentRegsSnap = await getDocs(recentRegsQuery);
		const recentRegistrations = recentRegsSnap.docs.map(doc => ({
			id: doc.id,
			...doc.data()
		}));

		return {
			stats: {
				users: usersSnap.size,
				tours: toursSnap.size,
				registrations: regsSnap.size,
			},
			recentRegistrations
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
			title: "Pilgrims",
			value: stats.users,
			icon: Users,
			color: "text-blue-400",
			link: "#",
		},
		{
			title: "Journeys",
			value: stats.tours,
			icon: MapPin,
			color: "text-[#d4af37]",
			link: "/admin/tours",
		},
		{
			title: "Registrations",
			value: stats.registrations,
			icon: ClipboardList,
			color: "text-emerald-400",
			link: "/admin/registrations",
		},
	];

	return (
		<div className="space-y-12 animate-in fade-in duration-700">
			<MetaDetails metaTitle="Sanctuary | Admin Dashboard" metaDescription="Overview of sacred paths and pilgrims." />

			<div className="flex flex-col md:flex-row justify-between items-end gap-6 border-b border-[#d4af37]/10 pb-10">
				<div className="space-y-2">
					<h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37]">Operational Sanctuary</h4>
					<h1 className="text-5xl font-serif text-[#fdfcf0] tracking-tight">Admin Overview</h1>
					<p className="text-[#fdfcf0]/40 text-sm font-sans font-light uppercase tracking-widest leading-relaxed">Overseeing sacred paths and spiritual journeys.</p>
				</div>
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
				{cards.map((card) => (
					<Card key={card.title} className="glass-card border border-[#d4af37]/10 rounded-[2.5rem] overflow-hidden group hover:border-[#d4af37]/30 transition-all duration-500">
						<CardContent className="p-10 flex items-center justify-between">
							<div className="space-y-2">
								<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em]">{card.title}</p>
								<p className="text-5xl font-serif text-[#fdfcf0] tracking-tight">{card.value}</p>
							</div>
							<div className={`p-5 rounded-full glass-card border border-[#d4af37]/20 ${card.color}`}>
								<card.icon className="h-8 w-8" />
							</div>
						</CardContent>
						<div className="px-10 pb-6">
							<Link to={card.link} prefetch="intent" viewTransition className="text-[9px] font-bold text-[#d4af37]/60 uppercase tracking-[0.3em] hover:text-[#d4af37] transition-colors flex items-center gap-2">
								Manage {card.title} <ArrowRight className="h-3 w-3" />
							</Link>
						</div>
					</Card>
				))}
			</div>

			<div className="grid lg:grid-cols-3 gap-12">
				{/* Recent Activity */}
				<Card className="lg:col-span-2 glass-card border border-[#d4af37]/10 rounded-[2.5rem] overflow-hidden">
					<CardHeader className="px-10 py-8 border-b border-white/5 flex flex-row items-center justify-between bg-white/5">
						<div className="flex items-center gap-4">
							<Calendar className="h-5 w-5 text-[#d4af37]" />
							<CardTitle className="text-sm font-bold uppercase tracking-[0.2em] text-[#fdfcf0]/80">Recent Pilgrim Registrations</CardTitle>
						</div>
					</CardHeader>
					<CardContent className="p-0">
						{recentRegistrations.length > 0 ? (
							<div className="divide-y divide-white/5">
								{recentRegistrations.map((reg: any) => (
									<div key={reg.id} className="p-8 flex items-center justify-between hover:bg-white/5 transition-all duration-300">
										<div className="flex items-center gap-6">
											<div className="h-12 w-12 rounded-full glass-card border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]/40">
												<User className="h-6 w-6" />
											</div>
											<div className="space-y-1">
												<p className="font-serif text-[#fdfcf0] text-lg">{(reg as any).profileSnapshot?.first_name} {(reg as any).profileSnapshot?.last_name}</p>
												<p className="text-[10px] text-[#fdfcf0]/40 font-bold uppercase tracking-widest">{(reg as any).tours?.name}</p>
											</div>
										</div>
										<div className="text-right space-y-2">
											<div className="flex items-center gap-1 text-[#d4af37] font-serif text-lg justify-end">
												<IndianRupee className="h-3.5 w-3.5" />
												{((reg as any).tours?.price * (reg as any).travellersCount).toLocaleString()}
											</div>
											<Badge className={`text-[8px] uppercase tracking-widest border font-bold px-3 py-1 rounded-full bg-transparent ${reg.status === 'CONFIRMED' ? 'text-emerald-400 border-emerald-400/20' : 'text-[#d4af37] border-[#d4af37]/20'}`}>{(reg as any).status}</Badge>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="p-32 text-center space-y-4">
								<p className="text-[#fdfcf0]/20 font-serif italic text-2xl uppercase tracking-widest">No recent pilgrims found.</p>
							</div>
						)}
					</CardContent>
				</Card>

				{/* Secondary Information & Paths */}
				<div className="space-y-8">
					<Card className="glass-card border border-[#d4af37]/10 rounded-[2.5rem] p-10 flex flex-col items-center text-center space-y-6">
						<div className="h-20 w-20 rounded-full glass-card border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]/40">
							<PlusCircle className="h-10 w-10" />
						</div>
						<div className="space-y-2">
							<p className="text-[#fdfcf0] font-serif text-xl tracking-tight">Expand Sanctuary</p>
							<p className="text-[10px] text-[#fdfcf0]/40 font-bold uppercase tracking-widest leading-relaxed">Initiate new sacred paths and pilgrimage experiences.</p>
						</div>
						<Button asChild className="rounded-full bg-[#d4af37] text-[#0a0e1a] font-bold uppercase tracking-[0.2em] text-[10px] px-8 h-14 hover:bg-[#b8860b] transition-all">
							<Link to="/admin/tours/add" prefetch="intent" viewTransition>Initiate Journey</Link>
						</Button>
					</Card>
				</div>
			</div>
		</div>
	);
}

