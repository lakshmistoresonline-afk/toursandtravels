import { useLoaderData, Link } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, MapPin, ClipboardList, TrendingUp, PlusCircle, ArrowRight } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@workspace/shared/lib/firebase";
import { Button } from "~/components/ui/button";

export const clientLoader = async () => {
	try {
		const usersSnap = await getDocs(collection(db, "users"));
		const toursSnap = await getDocs(collection(db, "tours"));
		const regsSnap = await getDocs(collection(db, "registrations"));

		return {
			stats: {
				users: usersSnap.size,
				tours: toursSnap.size,
				registrations: regsSnap.size,
			}
		};
	} catch (error) {
		return { stats: { users: 0, tours: 0, registrations: 0 } };
	}
};

export default function AdminDashboard() {
	const { stats } = useLoaderData<typeof clientLoader>();

	const cards = [
		{
			title: "Total Customers",
			value: stats.users,
			icon: Users,
			color: "bg-blue-500",
			textColor: "text-blue-600",
			link: "#",
			desc: "Registered users on platform"
		},
		{
			title: "Active Tours",
			value: stats.tours,
			icon: MapPin,
			color: "bg-emerald-500",
			textColor: "text-emerald-600",
			link: "/admin/tours",
			desc: "Tours currently initiated"
		},
		{
			title: "Registrations",
			value: stats.registrations,
			icon: ClipboardList,
			color: "bg-purple-500",
			textColor: "text-purple-600",
			link: "/admin/registrations",
			desc: "Confirmed bookings by users"
		},
	];

	return (
		<div className="space-y-10 animate-in fade-in duration-500">
			<MetaDetails metaTitle="Dashboard | Ambady Tours and Travels Admin" />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				<div>
					<h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
					<p className="text-slate-500 mt-2 text-lg">Welcome back! Here's what's happening today.</p>
				</div>
				<div className="flex gap-3">
					<Button asChild size="lg" className="rounded-2xl px-8 py-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
						<Link to="/admin/tours/add">
							<PlusCircle className="mr-2 h-5 w-5" />
							Initiate New Tour
						</Link>
					</Button>
				</div>
			</div>

			<div className="grid md:grid-cols-3 gap-8">
				{cards.map((card) => (
					<Card key={card.title} className="border-none shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl overflow-hidden group">
						<CardContent className="p-8">
							<div className="flex justify-between items-start mb-6">
								<div className={`p-4 rounded-2xl ${card.color} text-white shadow-lg`}>
									<card.icon className="h-6 w-6" />
								</div>
								<div className="text-right">
									<p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{card.title}</p>
									<p className="text-4xl font-black text-slate-900 mt-1 tracking-tighter">{card.value}</p>
								</div>
							</div>
							<p className="text-slate-500 text-sm mb-6">{card.desc}</p>
							<Link to={card.link} className={`flex items-center gap-2 text-sm font-bold ${card.textColor} hover:opacity-80 transition-opacity`}>
								Explore Details <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
							</Link>
						</CardContent>
					</Card>
				))}
			</div>

			<div className="grid lg:grid-cols-2 gap-8">
				<Card className="rounded-3xl border-none shadow-sm bg-gradient-to-br from-slate-900 to-slate-800 text-white overflow-hidden relative">
					<div className="absolute top-0 right-0 p-12 opacity-10">
						<TrendingUp className="h-48 w-48" />
					</div>
					<CardHeader className="p-10 pb-0">
						<CardTitle className="text-2xl font-bold">Admin Insights</CardTitle>
					</CardHeader>
					<CardContent className="p-10 pt-6 relative z-10">
						<p className="text-slate-300 text-lg leading-relaxed max-w-md">
							Your tour registration rate is growing. Use the **Manual Registration** tool in the bookings section to help users who call in directly.
						</p>
						<Button asChild variant="secondary" className="mt-10 rounded-2xl px-8 font-bold">
							<Link to="/admin/registrations">Open Bookings</Link>
						</Button>
					</CardContent>
				</Card>

				<Card className="rounded-3xl border-none shadow-sm bg-white p-10 flex flex-col justify-center items-center text-center space-y-6">
					<div className="bg-primary/10 p-6 rounded-full">
						<MapPin className="h-10 w-10 text-primary" />
					</div>
					<div className="space-y-2">
						<h3 className="text-2xl font-bold text-slate-900">Inventory Status</h3>
						<p className="text-slate-500">Currently managing {stats.tours} unique destinations.</p>
					</div>
					<Button asChild variant="outline" className="rounded-2xl px-8 border-2 font-bold hover:bg-slate-50">
						<Link to="/admin/tours">Manage Inventory</Link>
					</Button>
				</Card>
			</div>
		</div>
	);
}
