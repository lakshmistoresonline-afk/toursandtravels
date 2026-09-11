import {
	Form,
	type LoaderFunctionArgs,
	useActionData,
	useLoaderData,
	useNavigation,
	Link,
} from "react-router";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
	Calendar,
	Loader2,
	MapPin,
	ArrowLeft,
	ShieldCheck,
	CheckCircle2,
	Clock,
	Users
} from "lucide-react";
import { useMemo, useEffect } from "react";
import TourImageCarousel from "~/components/Tour/TourImageCarousel";
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

	let isAlreadyRegistered = false;
	if (userData.user) {
		const bookingSvc = new BookingService();
		const myRegs = await bookingSvc.getMyRegistrations();
		isAlreadyRegistered = myRegs.registrations.some((r: any) => r.tourId === params.id);
	}

	return { tour, userData, isAlreadyRegistered };
};

export const clientAction = async ({ request, params }: any) => {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "register") {
		const userData = await getCurrentUser(request);
		if (userData.user?.role === "admin") {
			return { success: false, error: "Administrators cannot register for journeys." };
		}

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
	const isAlreadyRegistered = loaderData?.isAlreadyRegistered;

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Successfully registered for this pilgrimage journey!");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	if (!tour) return <div className="container py-20 text-center text-[#fdfcf0]/40">Journey not found</div>;

	const tour_images = useMemo(() => {
		const isUrlValid = (url: string | null) => {
			return url && url !== "" && !url.includes("placeholder") && url.startsWith("http");
		};

		const filteredImages = tour?.images?.filter((i: string | null) => isUrlValid(i)) ?? [];
		const images = [];

		if (isUrlValid(tour?.cover_image)) {
			images.push({ url: tour.cover_image, title: tour.name });
		}

		filteredImages.forEach((url: string, idx: number) => {
			images.push({
				url,
				title: `${tour.name} - ${idx + 1}`,
			});
		});

		return images;
	}, [tour]);

	const isRegistering = navigation.state === "submitting" && navigation.formData?.get("intent") === "register";
	const isRegistrationOpen = tour.status === "REGISTRATION_OPEN" || tour.status === "PUBLISHED";

	return (
		<div className="min-h-screen bg-[#0a0e1a] animate-in fade-in duration-1000">
			<MetaDetails
				metaTitle={tour.name + " | AMBADY Pilgrimage"}
				metaDescription={tour.overview?.slice(0, 320)}
			/>

			{/* Back Navigation */}
			<div className="container mx-auto px-6 pt-12 pb-8">
				<Link to="/" className="inline-flex items-center gap-2 text-[9px] font-bold uppercase tracking-[0.3em] text-[#d4af37]/60 hover:text-[#d4af37] transition-colors">
					<ArrowLeft className="h-3 w-3" /> Back to Home
				</Link>
			</div>

			<div className="container mx-auto px-6 max-w-6xl pb-32">
				<div className="grid lg:grid-cols-[1fr_360px] gap-16">

					{/* Main Content Area */}
					<div className="space-y-12">
						{/* Journey Heading */}
						<div className="space-y-6">
							<div className="flex flex-wrap items-center gap-3">
								<Badge className="bg-[#d4af37]/10 text-[#d4af37] border-white/5 px-3 py-1 rounded-full text-[8px] font-bold uppercase tracking-widest">
									{tour.tour_code || "JOURNEY"}
								</Badge>
								<TourStatusBadge status={tour.status || "PUBLISHED"} />
							</div>
							<div className="space-y-4">
								<h1 className="text-5xl md:text-7xl font-serif text-[#fdfcf0] leading-tight tracking-tight">
									{tour.name}
								</h1>
								<div className="flex items-center gap-2 text-[#fdfcf0]/40 font-bold uppercase tracking-[0.2em] text-[10px]">
									<MapPin className="h-3.5 w-3.5 text-[#d4af37]" />
									<span>{tour.destination || "Sacred Destination"}</span>
								</div>
							</div>
						</div>

						{/* Media Section - Only if valid images exist */}
						{tour_images.length > 0 && (
							<div className="rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl bg-white/5">
								<TourImageCarousel images={tour_images} />
							</div>
						)}

						{/* Content Sections */}
						<div className="grid gap-16 pt-12 border-t border-white/5">
							{tour.overview && (
								<div className="space-y-6">
									<h2 className="text-2xl font-serif text-[#fdfcf0] flex items-center gap-3">
										<CheckCircle2 className="h-6 w-6 text-[#d4af37]" /> Overview
									</h2>
									<div className="text-lg leading-relaxed text-[#fdfcf0]/60 whitespace-pre-wrap font-sans font-light">
										{tour.overview}
									</div>
								</div>
							)}

							{tour.itinerary && tour.itinerary.length > 0 && (
								<div className="space-y-10">
									<h2 className="text-2xl font-serif text-[#fdfcf0] flex items-center gap-3">
										<Calendar className="h-6 w-6 text-[#d4af37]" /> The Journey Roadmap
									</h2>
									<div className="space-y-10 relative">
										<div className="absolute left-6 top-2 bottom-2 w-[1px] bg-[#d4af37]/10" />
										{tour.itinerary.map((day: any) => (
											<div key={day.id} className="relative flex gap-10">
												<div className="h-12 w-12 min-w-[3rem] rounded-full border border-[#d4af37]/20 bg-[#0a0e1a] flex items-center justify-center font-serif text-lg text-[#d4af37] z-10 shadow-xl">
													{day.day_number}
												</div>
												<div className="space-y-3 pt-1">
													<h3 className="text-xl font-serif text-[#fdfcf0]">{day.title}</h3>
													<p className="text-[#fdfcf0]/40 font-sans text-sm leading-relaxed">{day.description}</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Sidebar Selection */}
					<aside>
						<div className="sticky top-24 bg-white/5 border border-white/10 rounded-[3rem] overflow-hidden shadow-2xl">
							<div className="bg-[#d4af37]/5 border-b border-white/5 p-10 space-y-4">
								<p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">Spiritual Exchange</p>
								<div className="flex items-baseline gap-2">
									<span className="text-5xl font-serif text-[#d4af37]">
										{tour.price > 0 ? `₹${tour.price.toLocaleString()}` : "Inquiry Only"}
									</span>
									{tour.price > 0 && <span className="text-[#fdfcf0]/20 text-[10px] font-bold uppercase tracking-widest">/ pilgrim</span>}
								</div>
							</div>

							<div className="p-10 space-y-10">
								<div className="grid grid-cols-2 gap-4">
									<div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
										<p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#d4af37]/40">Departure</p>
										<p className="font-bold text-[#fdfcf0] text-xs uppercase tracking-widest">{tour.start_date || 'Flexible'}</p>
									</div>
									<div className="p-5 rounded-2xl bg-white/5 border border-white/5 text-center space-y-1">
										<p className="text-[8px] font-bold uppercase tracking-[0.2em] text-[#d4af37]/40">Limit</p>
										<p className="font-bold text-[#fdfcf0] text-xs uppercase tracking-widest">{tour.max_participants || "20"}</p>
									</div>
								</div>

								<div className="space-y-6">
									{!user ? (
										<div className="text-center space-y-6 py-10 px-6 border border-dashed border-[#d4af37]/20 rounded-3xl bg-[#d4af37]/5">
											<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-widest leading-relaxed">Sign in to reserve your place on this path.</p>
											<Button asChild className="w-full rounded-full h-14 bg-[#d4af37] text-[#0a0e1a] font-bold uppercase tracking-widest text-[9px] shadow-xl shadow-[#d4af37]/10"><Link to="/login">Sign In</Link></Button>
										</div>
									) : user.role === "admin" ? (
										<div className="text-center space-y-4 py-10 px-6 border border-[#d4af37]/20 rounded-3xl bg-[#d4af37]/5">
											<ShieldCheck className="h-6 w-6 text-[#d4af37] mx-auto opacity-40" />
											<div className="space-y-1">
												<p className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-widest">Administrator Access</p>
												<p className="text-[8px] text-[#d4af37] font-bold uppercase tracking-[0.3em]">Registration Disabled</p>
											</div>
										</div>
									) : isAlreadyRegistered ? (
										<div className="text-center space-y-4 py-10 px-6 border border-emerald-500/20 rounded-3xl bg-emerald-500/5">
											<CheckCircle2 className="h-6 w-6 text-emerald-400 mx-auto" />
											<div className="space-y-1">
												<p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Journey Joined</p>
												<p className="text-[8px] text-emerald-400/60 font-bold uppercase tracking-[0.3em]">You are registered for this path.</p>
											</div>
											<Button asChild variant="outline" className="w-full rounded-full h-12 border-emerald-500/20 text-emerald-400 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 transition-all mt-2">
												<Link to="/account/bookings">View My Journeys</Link>
											</Button>
										</div>
									) : isRegistrationOpen ? (
										<Form method="post" className="space-y-8">
											<input type="hidden" name="intent" value="register" />
											<div className="space-y-3">
												<label className="text-[9px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em] ml-2">Number of Pilgrims</label>
												<Input type="number" name="travellersCount" defaultValue={1} min={1} max={tour.max_participants || 50} className="h-14 rounded-2xl bg-white/5 border-white/10 font-serif text-2xl px-6 text-[#d4af37] focus-visible:ring-[#d4af37]/20 transition-all" />
											</div>
											<div className="space-y-3">
												<label className="text-[9px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em] ml-2">Spiritual Requests</label>
												<textarea name="notes" className="w-full min-h-[120px] p-6 bg-white/5 border border-white/10 rounded-3xl text-xs font-light text-[#fdfcf0]/60 focus:ring-1 focus:ring-[#d4af37]/20 transition-all outline-none resize-none" placeholder="Any special needs?"></textarea>
											</div>

											<Button type="submit" className="w-full h-20 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] bg-[#d4af37] text-[#0a0e1a] shadow-2xl shadow-[#d4af37]/10 hover:bg-[#b8860b] transition-all" disabled={isRegistering}>
												{isRegistering ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : "Reserve Your Place"}
											</Button>
										</Form>
									) : (
										<div className="text-center p-10 bg-red-500/5 rounded-3xl border border-red-500/10 font-bold text-red-400 uppercase tracking-[0.2em] text-[10px]">
											Registration is {tour.status?.replace('_', ' ')}
										</div>
									)}
								</div>
							</div>
						</div>
					</aside>
				</div>
			</div>
		</div>
	);
}

function TourStatusBadge({ status }: { status: string }) {
	const variants: Record<string, string> = {
		REGISTRATION_OPEN: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
		PUBLISHED: "text-[#d4af37] border-[#d4af37]/20 bg-[#d4af37]/5",
		REGISTRATION_CLOSED: "text-red-400 border-red-400/20 bg-red-400/5",
		DRAFT: "text-slate-400 border-slate-400/20 bg-slate-400/5",
	};
	return <Badge className={`px-3 py-1 rounded-full border font-bold text-[9px] uppercase tracking-[0.2em] ${variants[status] || ""}`}>{status?.replace('_', ' ')}</Badge>;
}

function Input({ ...props }: any) {
	return <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;
}
