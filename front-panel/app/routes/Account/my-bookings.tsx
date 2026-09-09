import { useLoaderData, redirect, type LoaderFunctionArgs, Link } from "react-router";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Calendar, MapPin } from "lucide-react";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { BookingService } from "@workspace/shared/services/booking.service";
import { MetaDetails } from "~/components/SEO/MetaDetails";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user) return redirect("/login");

	try {
		const svc = new BookingService();
		const result = await svc.getMyRegistrations();
		return { registrations: result.registrations };
	} catch (error) {
		return { registrations: [] };
	}
};

export default function MyBookingsPage() {
	const { registrations } = useLoaderData<typeof loader>();

	return (
		<div className="container mx-auto max-w-4xl px-4">
			<MetaDetails metaTitle="My Tours | Ambady Tours and Travels" />
			<div className="mb-8">
				<h1 className="text-3xl font-bold">My Tour History</h1>
				<p className="text-muted-foreground mt-2">Manage your current and past registrations.</p>
			</div>

			{registrations.length === 0 ? (
				<Card className="py-20 text-center border-dashed">
					<p className="text-muted-foreground">You haven't joined any tours yet.</p>
					<Link to="/tours" className="text-primary hover:underline mt-4 inline-block font-medium">Explore available tours</Link>
				</Card>
			) : (
				<div className="grid gap-6">
					{registrations.map((reg: any) => (
						<Card key={reg.id} className="overflow-hidden">
							<CardContent className="p-0">
								<div className="flex flex-col md:flex-row">
									<div className="w-full md:w-48 h-32 md:h-auto">
										<img
											src={reg.tours?.cover_image || "/placeholder-tour.jpg"}
											alt={reg.tours?.name}
											className="w-full h-full object-cover"
										/>
									</div>
									<div className="p-6 flex-1">
										<div className="flex justify-between items-start">
											<div>
												<h3 className="text-xl font-bold">{reg.tours?.name}</h3>
												<div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
													<span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {reg.tours?.destination}</span>
													<span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {reg.tours?.start_date || 'TBD'}</span>
												</div>
											</div>
											<Badge variant={reg.status === 'CONFIRMED' ? 'default' : 'warning'}>
												{reg.status}
											</Badge>
										</div>
										<div className="mt-4 pt-4 border-t flex justify-between items-center text-sm">
											<div>
												<span className="font-semibold">{reg.travellersCount} Travellers</span>
											</div>
											<div className="text-muted-foreground text-xs italic">
												Registered on {reg.createdAt ? format(new Date(reg.createdAt), "PPP") : 'Recently'}
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
