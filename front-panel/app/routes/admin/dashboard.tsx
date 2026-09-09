import { useLoaderData, Link } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Users, MapPin, ClipboardList, TrendingUp } from "lucide-react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@workspace/shared/lib/firebase";

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
		{ title: "Published Tours", value: stats.tours, icon: MapPin, color: "text-green-600", link: "/admin/tours" },
		{ title: "Total Registrations", value: stats.registrations, icon: ClipboardList, color: "text-purple-600", link: "/admin/registrations" },
	];

	return (
		<div className="space-y-8">
			<MetaDetails metaTitle="Admin Dashboard | WanderNest" />
			<h1 className="text-3xl font-bold">System Overview</h1>

			<div className="grid md:grid-cols-3 gap-6">
				{cards.map((card) => (
					<Card key={card.title}>
						<CardHeader className="flex flex-row items-center justify-between pb-2">
							<CardTitle className="text-sm font-medium">{card.title}</CardTitle>
							<card.icon className={`h-4 w-4 ${card.color}`} />
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold">{card.value}</div>
							<Link to={card.link} className="text-xs text-muted-foreground hover:underline">
								View all details
							</Link>
						</CardContent>
					</Card>
				))}
			</div>

			<Card className="p-8 text-center bg-primary/5 border-dashed">
				<TrendingUp className="h-12 w-12 mx-auto text-primary opacity-50 mb-4" />
				<h2 className="text-xl font-semibold">Welcome to the Firebase Admin Panel</h2>
				<p className="text-muted-foreground mt-2 max-w-md mx-auto">
					Manage your tours, track registrations, and oversee customer profiles all in one place.
				</p>
			</Card>
		</div>
	);
}
