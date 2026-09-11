import { useLoaderData, redirect, type LoaderFunctionArgs, Link } from "react-router";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Calendar, MapPin, Compass } from "lucide-react";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { BookingService } from "@workspace/shared/services/booking.service";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { useState } from "react";

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
	const { registrations } = useLoaderData<any>();
	const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

	const isUrlValid = (url: string | null | undefined) => {
		return !!(url && url.length > 12 && url.startsWith("http") && !url.endsWith("-"));
	};

	return (
		<div className="container mx-auto max-w-5xl px-6 animate-in fade-in duration-700 bg-background">
			<MetaDetails
				metaTitle="My Pilgrimage Journeys | AMBADY"
				metaDescription="View your upcoming and past sacred journeys."
			/>
			<div className="mb-12">
				<h4 className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary mb-3">
					History
				</h4>
				<h1 className="text-4xl md:text-5xl font-serif text-foreground leading-tight">
					My Pilgrimage History
				</h1>
				<p className="text-foreground/40 mt-3 text-sm font-sans uppercase tracking-[0.1em] font-medium leading-relaxed">
					View your past and upcoming sacred registrations.
				</p>
			</div>

			{registrations.length === 0 ? (
				<div className="py-32 text-center bg-card rounded-[3rem] border border-dashed border-primary/30 shadow-sm">
					<Compass className="h-16 w-16 text-primary/20 mx-auto mb-6" />
					<p className="text-foreground/60 text-sm font-bold uppercase tracking-widest">
						You haven't joined any pilgrimage journeys yet.
					</p>
					<Link
						to="/tours"
						className="text-primary hover:text-foreground mt-8 inline-block text-[11px] font-bold uppercase tracking-[0.2em] border-b border-primary/40 pb-1 transition-all"
					>
						Explore Sacred Pilgrimage Journeys
					</Link>
				</div>
			) : (
				<div className="grid gap-10">
					{registrations.map((reg: any) => (
						<Card
							key={reg.id}
							className="bg-card border border-primary/10 rounded-[2.5rem] overflow-hidden group hover:border-primary/30 transition-all duration-500 shadow-xl"
						>
							<CardContent className="p-0">
								<div className="flex flex-col md:flex-row">
									<div className="w-full md:w-72 h-56 md:h-auto overflow-hidden bg-muted flex items-center justify-center border-r border-primary/5">
										{!imgErrors[reg.id] && isUrlValid(reg.tours?.cover_image) ? (
											<img
												src={reg.tours.cover_image!}
												alt=""
												onError={() =>
													setImgErrors((prev) => ({ ...prev, [reg.id]: true }))
												}
												className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
											/>
										) : (
											<Compass className="h-12 w-12 text-primary opacity-20" />
										)}
									</div>
									<div className="p-10 flex-1 space-y-8">
										<div className="flex justify-between items-start gap-6">
											<div className="space-y-3">
												<h3 className="text-3xl font-serif text-foreground group-hover:text-primary transition-colors leading-tight">
													{reg.tours?.name}
												</h3>
												<div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-foreground/40 uppercase tracking-widest">
													<span className="flex items-center gap-2">
														<MapPin className="h-4 w-4 text-primary" />{" "}
														{reg.tours?.destination}
													</span>
													<span className="flex items-center gap-2">
														<Calendar className="h-4 w-4 text-primary" />{" "}
														{reg.tours?.start_date || "TBD"}
													</span>
												</div>
											</div>
											<Badge
												className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border shadow-sm ${reg.status === "CONFIRMED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" : "bg-primary/10 text-primary border-primary/20"}`}
											>
												{reg.status}
											</Badge>
										</div>
										<div className="pt-8 border-t border-primary/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
											<div className="text-foreground/70">
												<span className="text-primary text-sm">
													{reg.travellersCount}
												</span>{" "}
												Pilgrims Registered
											</div>
											<div className="text-foreground/30 font-medium">
												Registered:{" "}
												{reg.createdAt
													? format(new Date(reg.createdAt), "PPP")
													: "Recently"}
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
