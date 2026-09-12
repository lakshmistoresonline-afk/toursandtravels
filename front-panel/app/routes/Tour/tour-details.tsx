import {
	Form,
	type LoaderFunctionArgs,
	useActionData,
	useLoaderData,
	useNavigation,
	Link,
} from "react-router";
import { Button } from "~/components/ui/button";
import { Calendar, Loader2, MapPin, ShieldCheck, CheckCircle2, Compass, QrCode, CreditCard, Banknote } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import TourImageCarousel from "~/components/Tour/TourImageCarousel";
import { tourDetailsQuery } from "~/queries/tours.q";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { BackButton } from "~/components/ui/back-button";
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
		const paymentMode = formData.get("paymentMode")?.toString();

		try {
			const regId = await bookingSvc.createRegistration(
				params.id!,
				travellersCount,
				notes,
				paymentMode,
			);
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

	const [paymentMode, setPaymentMode] = useState<"CASH" | "GPAY" | "OTHER_UPI">("CASH");

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Successfully registered for this pilgrimage journey!");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	if (!tour) return <div className="container py-32 text-center text-foreground/40">Journey not found</div>;

	const tour_images = useMemo(() => {
		const isUrlValid = (url: string | null): url is string => {
			return !!(url && url !== "" && !url.includes("placeholder") && url.startsWith("http"));
		};

		const filteredImages = tour?.images?.filter(isUrlValid) ?? [];
		const images: Array<{ url: string; title: string }> = [];

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

	const isRegistering =
		navigation.state === "submitting" && navigation.formData?.get("intent") === "register";
	const isRegistrationOpen = tour.status === "REGISTRATION_OPEN" || tour.status === "PUBLISHED";

	return (
		<div className="min-h-screen bg-background animate-in fade-in duration-1000 pb-32">
			<MetaDetails
				metaTitle={tour.name + " | AMBADY Pilgrimage"}
				metaDescription={tour.overview?.slice(0, 320)}
			/>

			{/* Hero/Cover Section */}
			<div className="relative h-[50vh] min-h-[400px] w-full overflow-hidden">
				<div className="absolute top-6 left-6 z-30">
					<BackButton className="bg-background/20 backdrop-blur-md text-white hover:bg-background/40 hover:text-white border border-white/10" fallbackUrl="/tours" label="Back to Journeys" />
				</div>
				{tour.cover_image ? (
					<img src={tour.cover_image} alt={tour.name} className="w-full h-full object-cover" />
				) : (
					<div className="w-full h-full bg-primary/5 flex items-center justify-center">
						<Compass className="h-20 w-20 text-primary opacity-20" />
					</div>
				)}
				<div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />

				<div className="absolute bottom-0 left-0 w-full p-8 md:p-16">
					<div className="container mx-auto max-w-6xl space-y-6">
						<div className="flex flex-wrap items-center gap-3">
							<Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[9px] font-bold uppercase tracking-widest shadow-lg">
								{tour.tour_code || "JOURNEY"}
							</Badge>
							<TourStatusBadge status={tour.status || "PUBLISHED"} />
						</div>
						<h1 className="text-5xl md:text-7xl font-serif text-foreground leading-tight tracking-tight drop-shadow-sm">
							{tour.name}
						</h1>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-6 max-w-6xl pt-16">
				<div className="grid lg:grid-cols-[1fr_380px] gap-20">
					{/* Main Content Area */}
					<div className="space-y-16">
						{/* Journey Info Bar */}
						<div className="flex flex-wrap items-center gap-10 py-8 border-y border-primary/10">
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
									<MapPin className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">
										Destination
									</p>
									<p className="font-bold text-foreground uppercase tracking-wider">
										{tour.destination || "Holy Land"}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="h-10 w-10 rounded-full bg-primary/5 flex items-center justify-center text-primary">
									<Calendar className="h-5 w-5" />
								</div>
								<div>
									<p className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">
										Departure
									</p>
									<p className="font-bold text-foreground uppercase tracking-wider">
										{tour.start_date || "Flexible"}
									</p>
								</div>
							</div>
						</div>

						{/* Content Sections */}
						<div className="space-y-16">
							{tour.overview && (
								<div className="space-y-6">
									<h2 className="text-3xl font-serif text-foreground">Overview</h2>
									<div className="text-lg leading-relaxed text-foreground/70 whitespace-pre-wrap font-sans">
										{tour.overview}
									</div>
								</div>
							)}

							{tour_images.length > 1 && (
								<div className="space-y-6">
									<h2 className="text-3xl font-serif text-foreground">Gallery</h2>
									<div className="rounded-3xl overflow-hidden shadow-xl border border-primary/10">
										<TourImageCarousel images={tour_images} />
									</div>
								</div>
							)}

							{tour.itinerary && tour.itinerary.length > 0 && (
								<div className="space-y-10">
									<h2 className="text-3xl font-serif text-foreground">
										The Pilgrimage Roadmap
									</h2>
									<div className="space-y-0 relative pl-4">
										<div className="absolute left-9 top-4 bottom-4 w-px bg-primary/20" />
										{tour.itinerary.map((day: any) => (
											<div
												key={day.id}
												className="relative flex gap-10 pb-12 last:pb-0 group"
											>
												<div className="h-10 w-10 min-w-[2.5rem] rounded-full border-2 border-primary/20 bg-background flex items-center justify-center font-serif text-lg text-primary z-10 transition-colors group-hover:border-primary">
													{day.day_number}
												</div>
												<div className="space-y-2 pt-1">
													<h3 className="text-xl font-serif text-foreground">
														{day.title}
													</h3>
													<p className="text-foreground/60 text-base leading-relaxed">
														{day.description}
													</p>
												</div>
											</div>
										))}
									</div>
								</div>
							)}
						</div>
					</div>

					{/* Registration Sidebar */}
					<aside>
						<div className="sticky top-24 bg-card border border-primary/20 rounded-[2rem] overflow-hidden shadow-2xl">
							<div className="bg-primary/5 border-b border-primary/10 p-10 space-y-4">
								<p className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary">
									Exchange
								</p>
								<div className="flex items-baseline gap-2">
									<span className="text-5xl font-serif text-primary">
										{tour.price > 0 ? `₹${tour.price.toLocaleString()}` : "Inquiry Only"}
									</span>
									{tour.price > 0 && (
										<span className="text-foreground/40 text-[10px] font-bold uppercase tracking-widest">
											/ pilgrim
										</span>
									)}
								</div>
							</div>

							<div className="p-10 space-y-10">
								<div className="space-y-6">
									{!user ? (
										<div className="text-center space-y-6 py-10 px-6 border border-dashed border-primary/20 rounded-3xl bg-primary/5">
											<p className="text-[11px] font-bold text-foreground/40 uppercase tracking-widest leading-relaxed">
												Sign in to reserve your place on this path.
											</p>
											<Button
												asChild
												className="w-full rounded-full h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
											>
												<Link to="/login">Sign In to Register</Link>
											</Button>
										</div>
									) : user.role === "admin" ? (
										<div className="text-center space-y-4 py-10 px-6 border border-primary/20 rounded-3xl bg-primary/5">
											<ShieldCheck className="h-8 w-8 text-primary mx-auto opacity-40" />
											<div className="space-y-1">
												<p className="text-[11px] font-bold text-foreground/60 uppercase tracking-widest">
													Admin Access
												</p>
												<p className="text-[9px] text-primary font-bold uppercase tracking-[0.3em]">
													Registration Disabled
												</p>
											</div>
											<Button
												asChild
												variant="outline"
												className="w-full rounded-full h-12 border-primary/20 text-primary text-[9px] font-bold uppercase tracking-widest hover:bg-primary/5 mt-4"
											>
												<Link to={`/admin/tours/edit/${tour.id}`}>Edit Journey</Link>
											</Button>
										</div>
									) : isAlreadyRegistered ? (
										<div className="text-center space-y-4 py-10 px-6 border border-emerald-500/20 rounded-3xl bg-emerald-500/5">
											<CheckCircle2 className="h-8 w-8 text-emerald-600 mx-auto" />
											<div className="space-y-1">
												<p className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest">
													Journey Joined
												</p>
												<p className="text-[9px] text-emerald-600/60 font-bold uppercase tracking-[0.3em]">
													Your place is reserved.
												</p>
											</div>
											<Button
												asChild
												variant="outline"
												className="w-full rounded-full h-12 border-emerald-500/20 text-emerald-600 text-[9px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 mt-4"
											>
												<Link to="/account/bookings">My Registrations</Link>
											</Button>
										</div>
									) : isRegistrationOpen ? (
										<Form method="post" className="space-y-8">
											<input type="hidden" name="intent" value="register" />
											<div className="space-y-4">
												<label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.3em] ml-2">
													Pilgrims Count
												</label>
												<Input
													type="number"
													name="travellersCount"
													defaultValue={1}
													min={1}
													max={tour.max_participants || 50}
													className="h-14 rounded-2xl bg-white border-primary/20 font-serif text-2xl px-6 text-primary focus-visible:ring-primary/20 shadow-sm"
												/>
											</div>

											<div className="space-y-4">
												<label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.3em] ml-2">
													Payment Mode
												</label>
												<div className="grid grid-cols-1 gap-3">
													{[
														{ id: "CASH", label: "Cash Payment", icon: Banknote },
														{ id: "GPAY", label: "Google Pay", icon: CreditCard },
														{ id: "OTHER_UPI", label: "Other UPI", icon: QrCode },
													].map((mode) => (
														<label
															key={mode.id}
															className={`flex items-center gap-4 p-4 rounded-2xl border transition-all cursor-pointer ${
																paymentMode === mode.id
																	? "bg-primary/5 border-primary shadow-sm"
																	: "bg-white border-primary/10 hover:border-primary/30"
															}`}
														>
															<input
																type="radio"
																name="paymentMode"
																value={mode.id}
																className="sr-only"
																checked={paymentMode === mode.id}
																onChange={() => setPaymentMode(mode.id as any)}
															/>
															<div
																className={`h-10 w-10 rounded-xl flex items-center justify-center ${
																	paymentMode === mode.id
																		? "bg-primary text-primary-foreground"
																		: "bg-primary/5 text-primary"
																}`}
															>
																<mode.icon className="h-5 w-5" />
															</div>
															<span
																className={`text-[11px] font-bold uppercase tracking-widest ${
																	paymentMode === mode.id ? "text-primary" : "text-foreground/60"
																}`}
															>
																{mode.label}
															</span>
														</label>
													))}
												</div>
											</div>

											{paymentMode !== "CASH" && (
												<div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
													<div className="p-6 bg-primary/5 border border-primary/10 rounded-3xl space-y-4 text-center">
														<p className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">
															Scan to Pay
														</p>
														{(tour.qr_code_url || "/payment-qr.png") ? (
															<div className="bg-white p-4 rounded-2xl shadow-inner inline-block mx-auto border border-primary/10">
																<img
																	src={tour.qr_code_url || "/payment-qr.png"}
																	alt="Payment QR Code"
																	className="h-48 w-48 object-contain"
																/>
															</div>
														) : (
															<div className="h-48 w-48 mx-auto bg-primary/5 border border-dashed border-primary/20 rounded-2xl flex flex-col items-center justify-center p-6 gap-3 opacity-60">
																<QrCode className="h-10 w-10 text-primary" />
																<p className="text-[8px] font-bold text-primary uppercase tracking-widest leading-relaxed">
																	QR Code not set for this journey. Please contact admin.
																</p>
															</div>
														)}
														<p className="text-[9px] text-foreground/40 font-medium italic">
															Please save the screenshot of payment confirmation.
														</p>
													</div>
												</div>
											)}

											<div className="space-y-4">
												<label className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.3em] ml-2">
													Sacred Requests
												</label>
												<textarea
													name="notes"
													className="w-full min-h-[120px] p-6 bg-white border border-primary/20 rounded-3xl text-sm font-sans text-foreground/70 focus:ring-1 focus:ring-primary/20 transition-all outline-none resize-none shadow-sm"
													placeholder="Any special needs or prayers?"
												></textarea>
											</div>

											<Button
												type="submit"
												className="w-full h-20 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] bg-primary text-primary-foreground shadow-2xl shadow-primary/20 hover:bg-primary/90 hover:scale-[1.02] transition-all"
												disabled={isRegistering}
											>
												{isRegistering ? (
													<Loader2 className="animate-spin mr-3 h-6 w-6" />
												) : (
													"Join Pilgrimage"
												)}
											</Button>

											<p className="text-center text-[9px] text-foreground/40 font-bold uppercase tracking-widest">
												Limited to {tour.max_participants || 20} pilgrims
											</p>
										</Form>
									) : (
										<div className="text-center p-10 bg-red-500/5 rounded-3xl border border-red-500/10 font-bold text-red-600 uppercase tracking-[0.2em] text-[11px]">
											Registration is {tour.status?.replace("_", " ")}
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
		REGISTRATION_OPEN: "text-emerald-600 border-emerald-600/20 bg-emerald-600/5",
		PUBLISHED: "text-primary border-primary/20 bg-primary/5",
		REGISTRATION_CLOSED: "text-red-600 border-red-600/20 bg-red-600/5",
		DRAFT: "text-slate-500 border-slate-500/20 bg-slate-500/5",
	};
	return (
		<Badge
			className={`px-4 py-1.5 rounded-full border font-bold text-[9px] uppercase tracking-[0.2em] shadow-sm ${variants[status] || ""}`}
		>
			{status?.replace("_", " ")}
		</Badge>
	);
}
