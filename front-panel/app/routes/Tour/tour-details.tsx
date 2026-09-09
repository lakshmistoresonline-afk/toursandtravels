import {
	Form,
	type LoaderFunctionArgs,
	useActionData,
	useLoaderData,
	useNavigation,
	Link,
} from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import {
	Calendar,
	Users,
	Loader2,
	MapPin,
	IndianRupee,
	ArrowLeft,
	ShieldCheck,
	CheckCircle2
} from "lucide-react";
import { useMemo, useEffect } from "react";
import TourImageCarousel from "~/components/Tour/TourImageCarousel";
import { Separator } from "~/components/ui/separator";
import { tourDetailsQuery } from "~/queries/tours.q";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Badge } from "~/components/ui/badge";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { BookingService } from "@workspace/shared/services/booking.service";
import { toast } from "sonner";

export const clientLoader = async ({ params, request }: LoaderFunctionArgs) => {
	if (!params.id) return null;
	const tour = await tourDetailsQuery({ request, tour_id: params.id });
	const userData = await getCurrentUser(request);
	return { tour, userData };
};

export const clientAction = async ({ request, params }: any) => {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "register") {
		const bookingSvc = new BookingService();
		const travellersCount = Number(formData.get("travellersCount") || 1);
		const notes = formData.get("notes")?.toString();

		try {
			const regId = await bookingSvc.createRegistration(params.id!, travellersCount, notes);
			return { success: true, regId };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}
	return null;
};

export default function TourDetailsPage() {
	const loaderData = useLoaderData<typeof clientLoader>();
	const actionData = useActionData() as any;
	const navigation = useNavigation();

	const tour = loaderData?.tour;
	const user = loaderData?.userData?.user;

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Successfully registered for tour!");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	if (!tour) return <div className="container py-20 text-center text-slate-500">Tour not found</div>;

	const tour_images = useMemo(() => {
		const filteredImages = tour?.images?.filter((i: string | null) => i != null) ?? [];
		return [
			{ url: tour.cover_image, title: tour.name },
			...filteredImages.map((url: string, idx: number) => ({
				url,
				title: `${tour.name} - ${idx + 1}`,
			})),
		];
	}, [tour]);

	const isRegistering = navigation.state === "submitting" && navigation.formData?.get("intent") === "register";
	const isRegistrationOpen = tour.status === "REGISTRATION_OPEN" || tour.status === "PUBLISHED";

	return (
		<div className="bg-slate-50/30 min-h-screen pb-20 animate-in fade-in duration-700">
			<MetaDetails
				metaTitle={tour.name + " | Ambady Tours and Travels"}
				metaDescription={tour.overview?.slice(0, 320)}
			/>

			{/* Breadcrumb / Back button */}
			<div className="container mx-auto px-4 py-6">
				<Button variant="ghost" size="sm" asChild className="rounded-full hover:bg-white border-2 border-transparent hover:border-slate-100 transition-all font-bold text-slate-500">
					<Link to="/tours"><ArrowLeft className="mr-2 h-4 w-4" /> All Destinations</Link>
				</Button>
			</div>

			<div className="container mx-auto px-4">
				<div className="grid lg:grid-cols-[1fr_400px] gap-12">
					<div className="space-y-12">
						{/* Header Info */}
						<div className="space-y-6">
							<div className="flex items-center gap-3">
								<Badge className="bg-slate-900 px-4 py-1 rounded-full font-mono tracking-wider">{tour.tour_code}</Badge>
								<TourStatusBadge status={tour.status!} />
							</div>
							<h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter leading-tight">{tour.name}</h1>
							<div className="flex items-center gap-3 text-lg font-bold text-slate-500">
								<div className="p-2 bg-primary/10 rounded-xl"><MapPin className="h-5 w-5 text-primary" /></div>
								<span>{tour.destination}</span>
							</div>
						</div>

						{/* Carousel */}
						<div className="rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-200">
							<TourImageCarousel images={tour_images} />
						</div>

						{/* Sections */}
						<div className="grid md:grid-cols-2 gap-12 pt-8 border-t border-slate-100">
							<div className="space-y-6">
								<h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
									<CheckCircle2 className="h-6 w-6 text-primary" /> Overview
								</h2>
								<p className="text-lg leading-relaxed text-slate-600 whitespace-pre-wrap font-medium">{tour.overview}</p>
							</div>

							{tour.itinerary && tour.itinerary.length > 0 && (
								<div className="space-y-8">
									<h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
										<Calendar className="h-6 w-6 text-primary" /> Journey Itinerary
									</h2>
									<div className="space-y-10 relative">
										<div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-100" />
										{tour.itinerary.map((day: any) => (
											<div key={day.id} className="relative flex gap-8 group">
												<div className="h-12 w-12 rounded-2xl bg-white border-4 border-slate-50 shadow-sm flex items-center justify-center font-black text-slate-900 z-10 group-hover:bg-primary group-hover:text-white group-hover:border-primary/20 transition-all">
													{day.day_number}
												</div>
												<div className="space-y-2 pt-1">
													<h3 className="text-xl font-bold text-slate-900">{day.title}</h3>
													<p className="text-slate-500 leading-relaxed">{day.description}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Registration Sidebar */}
					<aside className="relative">
						<Card className="sticky top-28 border-none shadow-2xl shadow-slate-200 rounded-[2.5rem] overflow-hidden">
							<CardHeader className="bg-slate-900 text-white p-10">
								<div className="flex justify-between items-center mb-2">
									<p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Price</p>
									<Badge className="bg-emerald-500 text-white border-none shadow-lg">Save 20% today</Badge>
								</div>
								<div className="flex items-baseline gap-1">
									<span className="text-5xl font-black">₹{tour.price?.toLocaleString()}</span>
									<span className="text-slate-400 text-sm font-bold">/ person</span>
								</div>
							</CardHeader>
							<CardContent className="p-10 space-y-8">
								<div className="grid grid-cols-2 gap-4">
									<div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Start Date</p>
										<p className="font-bold text-slate-900">{tour.start_date || 'TBD'}</p>
									</div>
									<div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
										<p className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Capacity</p>
										<p className="font-bold text-slate-900">{tour.max_participants || "Unlim."}</p>
									</div>
								</div>

								<div className="space-y-4">
									{!user ? (
										<div className="text-center space-y-4 py-4 bg-primary/5 rounded-3xl border border-dashed border-primary/20">
											<p className="text-sm font-bold text-slate-600 px-6 leading-relaxed">Sign in to claim your spot and use your profile details.</p>
											<Button asChild className="rounded-2xl px-10 h-12 shadow-lg shadow-primary/20 font-black"><Link to="/login">Join as User</Link></Button>
										</div>
									) : isRegistrationOpen ? (
										<Form method="post" className="space-y-6">
											<input type="hidden" name="intent" value="register" />
											<div className="space-y-3">
												<label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Travellers</label>
												<Input type="number" name="travellersCount" defaultValue={1} min={1} max={tour.max_participants || 50} className="h-14 rounded-2xl bg-slate-50 border-none font-bold text-lg px-6 focus-visible:ring-primary/10" />
											</div>
											<div className="space-y-3">
												<label className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Notes (Optional)</label>
												<textarea name="notes" className="w-full min-h-[120px] p-6 bg-slate-50 border-none rounded-3xl text-sm font-medium focus:ring-2 focus:ring-primary/10 transition-all outline-none" placeholder="Dietary needs or special requests?"></textarea>
											</div>

											<div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-start gap-3">
												<ShieldCheck className="h-5 w-5 text-emerald-600 mt-0.5" />
												<div className="space-y-1">
													<p className="text-xs font-black text-emerald-700 uppercase">One-Click Booking</p>
													<p className="text-[11px] text-emerald-600 font-medium leading-tight">Details for **{user.first_name}** will be pulled from profile.</p>
												</div>
											</div>

											<Button type="submit" className="w-full h-16 rounded-2xl text-lg font-black shadow-2xl shadow-primary/30 hover:scale-[1.02] transition-transform active:scale-[0.98]" disabled={isRegistering}>
												{isRegistering ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : "Confirm Spot Now"}
											</Button>
										</Form>
									) : (
										<div className="text-center p-8 bg-red-50 rounded-3xl border border-red-100 font-black text-red-600 uppercase tracking-tighter shadow-inner">
											Registration is {tour.status?.replace('_', ' ')}
										</div>
									)}
								</div>
							</CardContent>
						</Card>
					</aside>
				</div>
			</div>
		</div>
	);
}

function TourStatusBadge({ status }: { status: string }) {
	const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
		REGISTRATION_OPEN: "bg-emerald-500 text-white",
		PUBLISHED: "bg-blue-500 text-white",
		REGISTRATION_CLOSED: "bg-red-500 text-white",
		DRAFT: "bg-slate-400 text-white",
	};
	return <Badge className={`px-4 py-1 rounded-full border-none shadow-sm font-bold text-[10px] uppercase tracking-widest ${variants[status] || ""}`}>{status?.replace('_', ' ')}</Badge>;
}

function Input({ ...props }: any) {
	return <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;
}
