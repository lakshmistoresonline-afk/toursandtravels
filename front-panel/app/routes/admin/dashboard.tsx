import { useLoaderData, Link } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, MapPin, ClipboardList, TrendingUp, PlusCircle } from "lucide-react";
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
		{ title: "Total Customers", value: stats.users, icon: Users, color: "text-blue-600", link: "#" },
		{ title: "Active Tours", value: stats.tours, icon: MapPin, color: "text-green-600", link: "/admin/tours" },
		{ title: "Total Registrations", value: stats.registrations, icon: ClipboardList, color: "text-purple-600", link: "/admin/registrations" },
	];

	return (
		<div className="space-y-8">
			<MetaDetails metaTitle="Admin Dashboard | WanderNest" />

			<div className="flex justify-between items-end">
				<div>
					<h1 className="text-3xl font-bold tracking-tight">System Overview</h1>
					<p className="text-muted-foreground mt-2">Manage your platform and track performance.</p>
				</div>
				<Button asChild size="lg" className="shadow-md">
					<Link to="/admin/tours/add">
						<PlusCircle className="mr-2 h-5 w-5" />
						Create New Tour
					</Link>
				</Button>
			</div>

			<div className="grid md:grid-cols-3 gap-6">
				{cards.map((card) => (
					<Card key={card.title} className="hover:shadow-md transition-shadow">
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">{card.title}</CardTitle>
							<card.icon className={`h-4 w-4 ${card.color}`} />
						</CardHeader>
						<CardContent>
							<div className="text-3xl font-bold">{card.value}</div>
							<Link to={card.link} className="text-xs text-primary font-medium hover:underline mt-1 block">
								View all details
							</Link>
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="p-12 text-center bg-white border shadow-sm">
				<TrendingUp className="h-16 w-16 mx-auto text-primary/40 mb-6" />
				<h2 className="text-2xl font-bold">Welcome to your Control Center</h2>
				<p className="text-muted-foreground mt-4 max-w-xl mx-auto text-lg leading-relaxed">
					From here you can initiate new tours, track registrations in real-time, and manage your growing customer base.
				</p>
				<div className="flex gap-4 justify-center mt-8">
					<Button asChild variant="outline">
						<Link to="/admin/registrations">View Registrations</Link>
					</Button>
					<Button asChild>
						<Link to="/admin/tours">Manage All Tours</Link>
					</Button>
				</div>
			</Card>
		</div>
	);
}
