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
			toast.success("Successfully registered for this pilgrimage journey!");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	if (!tour) return <div className="container py-20 text-center text-[#fdfcf0]/40">Journey not found</div>;

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
		<div className="min-h-screen pb-20 animate-in fade-in duration-1000">
			<MetaDetails
				metaTitle={tour.name + " | AMADY Pilgrimage"}
				metaDescription={tour.overview?.slice(0, 320)}
			/>

			{/* Breadcrumb / Back button */}
			<div className="container mx-auto px-4 py-8">
				<Button variant="ghost" size="sm" asChild className="rounded-full text-[#d4af37] hover:bg-[#d4af37]/10 hover:text-[#d4af37] transition-all font-bold uppercase tracking-widest text-[10px]">
					<Link to="/tours"><ArrowLeft className="mr-2 h-3.5 w-3.5" /> Back to Pilgrimage Journeys</Link>
				</Button>
			</div>

			<div className="container mx-auto px-4">
				<div className="grid lg:grid-cols-[1fr_420px] gap-16">
					<div className="space-y-16">
						{/* Header Info */}
						<div className="space-y-8">
							<div className="flex items-center gap-4">
								<Badge className="bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20 px-4 py-1.5 rounded-full font-sans text-[10px] font-bold uppercase tracking-[0.2em]">{tour.tour_code}</Badge>
								<TourStatusBadge status={tour.status!} />
							</div>
							<h1 className="text-5xl md:text-7xl font-serif text-[#fdfcf0] tracking-tight leading-[1.1]">{tour.name}</h1>
							<div className="flex items-center gap-4 text-[#fdfcf0]/60 font-sans font-bold uppercase tracking-[0.2em] text-sm">
								<MapPin className="h-5 w-5 text-[#d4af37]" />
								<span>{tour.destination}</span>
							</div>
						</div>

						{/* Carousel */}
						<div className="rounded-[3rem] overflow-hidden border border-[#d4af37]/10 shadow-2xl shadow-black/40">
							<TourImageCarousel images={tour_images} />
						</div>

						{/* Sections */}
						<div className="grid md:grid-cols-2 gap-16 pt-16 border-t border-[#d4af37]/10">
							<div className="space-y-8">
								<h2 className="text-3xl font-serif text-[#fdfcf0] flex items-center gap-4">
									<CheckCircle2 className="h-8 w-8 text-[#d4af37]" /> Overview
								</h2>
								<div className="text-lg leading-relaxed text-[#fdfcf0]/70 whitespace-pre-wrap font-sans font-light">
									{tour.overview}
								</div>
							</div>

							{tour.itinerary && tour.itinerary.length > 0 && (
								<div className="space-y-10">
									<h2 className="text-3xl font-serif text-[#fdfcf0] flex items-center gap-4">
										<Calendar className="h-8 w-8 text-[#d4af37]" /> The Journey
									</h2>
									<div className="space-y-12 relative">
										<div className="absolute left-7 top-2 bottom-2 w-[1px] bg-[#d4af37]/10" />
										{tour.itinerary.map((day: any) => (
											<div key={day.id} className="relative flex gap-10 group">
												<div className="h-14 w-14 min-w-[3.5rem] rounded-full glass-card border border-[#d4af37]/20 flex items-center justify-center font-serif text-xl text-[#d4af37] z-10 group-hover:bg-[#d4af37] group-hover:text-[#0a0e1a] transition-all duration-500">
													{day.day_number}
												</div>
												<div className="space-y-3 pt-2">
													<h3 className="text-xl font-serif text-[#fdfcf0]">{day.title}</h3>
													<p className="text-[#fdfcf0]/50 font-sans text-sm leading-relaxed font-light">{day.description}</p>
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
						<Card className="sticky top-32 glass-card border border-[#d4af37]/20 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/50">
							<CardHeader className="bg-[#d4af37]/5 border-b border-[#d4af37]/10 p-12">
								<div className="flex justify-between items-center mb-4">
									<p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">Spiritual Exchange</p>
									<Badge className="bg-[#d4af37] text-[#0a0e1a] border-none text-[10px] font-bold uppercase tracking-widest px-3 py-1">Limited Seats</Badge>
								</div>
								<div className="flex items-baseline gap-2">
									<span className="text-6xl font-serif text-[#d4af37]">₹{tour.price?.toLocaleString()}</span>
									<span className="text-[#fdfcf0]/40 text-xs font-bold uppercase tracking-widest">/ pilgrim</span>
								</div>
							</CardHeader>
							<CardContent className="p-12 space-y-10">
								<div className="grid grid-cols-2 gap-6">
									<div className="p-5 rounded-2xl bg-white/5 border border-white/5">
										<div className="flex items-center gap-2 mb-2 text-[#d4af37]/60">
											<Calendar className="h-3 w-3" />
											<p className="text-[9px] font-bold uppercase tracking-widest">Departure</p>
										</div>
										<p className="font-bold text-[#fdfcf0] text-sm uppercase tracking-wider">{tour.start_date || 'Flexible'}</p>
									</div>
									<div className="p-5 rounded-2xl bg-white/5 border border-white/5">
										<div className="flex items-center gap-2 mb-2 text-[#d4af37]/60">
											<Users className="h-3 w-3" />
											<p className="text-[9px] font-bold uppercase tracking-widest">Pilgrims</p>
										</div>
										<p className="font-bold text-[#fdfcf0] text-sm uppercase tracking-wider">{tour.max_participants || "20 Max"}</p>
									</div>
								</div>

								<div className="space-y-6">
									{!user ? (
										<div className="text-center space-y-6 py-10 px-6 bg-[#d4af37]/5 rounded-[2rem] border border-dashed border-[#d4af37]/20">
											<p className="text-xs font-bold text-[#fdfcf0]/60 uppercase tracking-widest leading-relaxed">Sign in to reserve your place on this sacred journey.</p>
											<Button asChild className="w-full rounded-full h-14 bg-[#d4af37] text-[#0a0e1a] font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-[#d4af37]/10 hover:bg-[#b8860b] transition-all"><Link to="/login">Sign In to Register</Link></Button>
										</div>
									) : isRegistrationOpen ? (
										<Form method="post" className="space-y-8">
											<input type="hidden" name="intent" value="register" />
											<div className="space-y-4">
												<label className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em] px-2">Number of Pilgrims</label>
												<Input type="number" name="travellersCount" defaultValue={1} min={1} max={tour.max_participants || 50} className="h-16 rounded-2xl bg-white/5 border-white/10 font-serif text-2xl px-8 text-[#d4af37] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" />
											</div>
											<div className="space-y-4">
												<label className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em] px-2">Spiritual Requests (Optional)</label>
												<textarea name="notes" className="w-full min-h-[140px] p-8 bg-white/5 border border-white/10 rounded-3xl text-sm font-light text-[#fdfcf0]/70 focus:ring-2 focus:ring-[#d4af37]/20 focus:border-[#d4af37]/40 transition-all outline-none resize-none" placeholder="Any special needs or spiritual requests?"></textarea>
											</div>

											<div className="p-6 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 flex items-start gap-4">
												<ShieldCheck className="h-5 w-5 text-emerald-500 mt-1" />
												<div className="space-y-1">
													<p className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Fast Registration</p>
													<p className="text-[11px] text-emerald-400/60 font-light leading-snug">Registration for **{user.first_name}** will use your profile details.</p>
												</div>
											</div>

											<Button type="submit" className="w-full h-20 rounded-full text-xs font-bold uppercase tracking-[0.2em] bg-[#d4af37] text-[#0a0e1a] shadow-2xl shadow-[#d4af37]/20 hover:scale-[1.02] transition-all active:scale-[0.98] hover:bg-[#b8860b]" disabled={isRegistering}>
												{isRegistering ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : "Register for Pilgrimage Journey"}
											</Button>
										</Form>
									) : (
										<div className="text-center p-10 bg-red-500/5 rounded-[2rem] border border-red-500/10 font-bold text-red-400 uppercase tracking-[0.3em] text-[10px] shadow-inner">
											Journey Registration is {tour.status?.replace('_', ' ')}
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
	const variants: Record<string, string> = {
		REGISTRATION_OPEN: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
		PUBLISHED: "text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10",
		REGISTRATION_CLOSED: "text-red-400 border-red-400/30 bg-red-400/10",
		DRAFT: "text-slate-400 border-slate-400/30 bg-slate-400/10",
	};
	return <Badge className={`px-4 py-1.5 rounded-full border shadow-sm font-bold text-[10px] uppercase tracking-[0.2em] ${variants[status] || ""}`}>{status?.replace('_', ' ')}</Badge>;
}

function Input({ ...props }: any) {
	return <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;
}
