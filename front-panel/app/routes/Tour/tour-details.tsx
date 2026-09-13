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
import defaultQrCode from "~/assets/images/payment-qr.png";

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
	const isFull = tour.max_participants && (tour.currentParticipants || 0) >= tour.max_participants;

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
							<Badge className="bg-primary text-primary-foreground px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest shadow-lg">
								{tour.tour_code || "JOURNEY"}
							</Badge>
							<TourStatusBadge status={tour.status || "PUBLISHED"} />
						</div>
						<h1 className="text-6xl md:text-8xl font-serif text-foreground leading-tight tracking-tight drop-shadow-sm">
							{tour.name}
						</h1>
					</div>
				</div>
			</div>

			<div className="container mx-auto px-6 max-w-6xl pt-16">
				<div className="grid lg:grid-cols-[1fr_420px] gap-20">
					{/* Main Content Area */}
					<div className="space-y-16">
						{/* Journey Info Bar */}
						<div className="flex flex-wrap items-center gap-12 py-10 border-y border-primary/20">
							<div className="flex items-center gap-4">
								<div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
									<MapPin className="h-7 w-7" />
								</div>
								<div>
									<p className="text-[12px] font-bold uppercase tracking-widest text-foreground/50">
										Destination
									</p>
									<p className="text-2xl font-bold text-foreground uppercase tracking-wider">
										{tour.destination || "Holy Land"}
									</p>
								</div>
							</div>
							<div className="flex items-center gap-4">
								<div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary shadow-sm border border-primary/20">
									<Calendar className="h-7 w-7" />
								</div>
								<div>
									<p className="text-[12px] font-bold uppercase tracking-widest text-foreground/50">
										Departure
									</p>
									<p className="text-2xl font-bold text-foreground uppercase tracking-wider">
										{tour.start_date || "Flexible"}
									</p>
								</div>
							</div>
						</div>

						{/* Content Sections */}
						<div className="space-y-24">
							{tour.overview && (
								<div className="space-y-10">
									<h2 className="text-5xl font-serif text-foreground tracking-tight border-l-4 border-primary pl-8">Overview</h2>
									<div className="text-2xl leading-relaxed text-foreground/80 whitespace-pre-wrap font-sans font-medium">
										{tour.overview}
									</div>
								</div>
							)}

							{tour_images.length > 1 && (
								<div className="space-y-10">
									<h2 className="text-5xl font-serif text-foreground tracking-tight border-l-4 border-primary pl-8">Gallery</h2>
									<div className="rounded-[3rem] overflow-hidden shadow-2xl border border-primary/10">
										<TourImageCarousel images={tour_images} />
									</div>
								</div>
							)}

							{tour.itinerary && tour.itinerary.length > 0 && (
								<div className="space-y-16">
									<h2 className="text-5xl font-serif text-foreground tracking-tight border-l-4 border-primary pl-8">
										The Pilgrimage Roadmap
									</h2>
									<div className="space-y-0 relative pl-4">
										<div className="absolute left-10 top-4 bottom-4 w-px bg-primary/20" />
										{tour.itinerary.map((day: any) => (
											<div
												key={day.id}
												className="relative flex gap-16 pb-20 last:pb-0 group"
											>
												<div className="h-14 w-14 min-w-[3.5rem] rounded-full border-2 border-primary/30 bg-background flex items-center justify-center font-serif text-2xl text-primary z-10 transition-colors group-hover:border-primary shadow-sm">
													{day.day_number}
												</div>
												<div className="space-y-6 pt-1">
													<h3 className="text-3xl font-serif text-foreground font-bold">
														{day.title}
													</h3>
													<p className="text-foreground/70 text-xl leading-relaxed font-medium">
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
						<div className="sticky top-24 bg-card border border-primary/30 rounded-[3.5rem] overflow-hidden shadow-2xl">
							<div className="bg-primary/10 border-b border-primary/20 p-12 space-y-8">
								<p className="text-[12px] font-bold uppercase tracking-wider text-primary text-center">
									Sacred Exchange
								</p>
								<div className="flex flex-col items-center gap-4">
									<span className="text-7xl font-serif text-primary font-bold">
										{tour.price > 0 ? `₹${tour.price.toLocaleString()}` : "Inquiry Only"}
									</span>
									{tour.price > 0 && (
										<span className="text-foreground/60 text-xs font-bold uppercase tracking-widest bg-primary/5 px-4 py-1.5 rounded-full border border-primary/10">
											per pilgrim journey
										</span>
									)}
								</div>
							</div>

							<div className="p-12 space-y-12">
								<div className="space-y-10">
									{!user ? (
										<div className="text-center space-y-10 py-16 px-10 border-2 border-dashed border-primary/30 rounded-[3rem] bg-primary/5 shadow-inner">
											<p className="text-lg font-bold text-foreground/70 uppercase tracking-widest leading-relaxed">
												Sign in to reserve your place on this path.
											</p>
											<Button
												asChild
												size="lg"
												className="w-full rounded-full h-20 bg-primary text-primary-foreground font-bold uppercase tracking-wider text-sm shadow-2xl shadow-primary/30 hover:scale-105 transition-transform"
											>
												<Link to="/login">Sign In to Register</Link>
											</Button>
										</div>
									) : user.role === "admin" ? (
										<div className="text-center space-y-8 py-16 px-10 border-2 border-primary/30 rounded-[3rem] bg-primary/5 shadow-inner">
											<ShieldCheck className="h-16 w-16 text-primary mx-auto opacity-70" />
											<div className="space-y-4">
												<p className="text-sm font-bold text-foreground/70 uppercase tracking-widest">
													Administrator Access
												</p>
												<p className="text-xs text-primary font-bold uppercase tracking-[0.4em]">
													Direct Management Mode
												</p>
											</div>
											<Button
												asChild
												size="lg"
												variant="outline"
												className="w-full rounded-full h-20 border-primary/40 text-primary text-xs font-bold uppercase tracking-wider hover:bg-primary/10 mt-6 shadow-sm"
											>
												<Link to={`/admin/tours/edit/${tour.id}`}>Edit Journey Details</Link>
											</Button>
										</div>
									) : isAlreadyRegistered ? (
										<div className="text-center space-y-8 py-16 px-10 border-2 border-emerald-500/30 rounded-[3rem] bg-emerald-500/5 shadow-sm">
											<CheckCircle2 className="h-16 w-16 text-emerald-600 mx-auto" />
											<div className="space-y-4">
												<p className="text-lg font-bold text-emerald-600 uppercase tracking-widest">
													Journey Joined
												</p>
												<p className="text-xs text-emerald-600/70 font-bold uppercase tracking-[0.3em]">
													Your place is reserved on this path.
												</p>
											</div>
											<Button
												asChild
												size="lg"
												variant="outline"
												className="w-full rounded-full h-14 border-emerald-500/30 text-emerald-600 text-[10px] font-bold uppercase tracking-widest hover:bg-emerald-500/10 mt-8 shadow-sm"
											>
												<Link to="/account/bookings">View My Registrations</Link>
											</Button>
										</div>
									) : isRegistrationOpen ? (
										<Form method="post" className="space-y-12">
											<input type="hidden" name="intent" value="register" />
											<div className="space-y-6">
												<label className="text-[12px] font-bold text-foreground/60 uppercase tracking-wider ml-4">
													Number of Pilgrims
												</label>
												<Input
													type="number"
													name="travellersCount"
													defaultValue={1}
													min={1}
													max={tour.max_participants || 50}
													className="h-20 rounded-[1.5rem] bg-white border-primary/30 font-serif text-4xl px-10 text-primary focus-visible:ring-primary/40 shadow-sm"
												/>
											</div>

											<div className="space-y-6">
												<label className="text-[12px] font-bold text-foreground/60 uppercase tracking-wider ml-4">
													Select Payment Method
												</label>
												<div className="grid grid-cols-1 gap-5">
													{[
														{ id: "CASH", label: "Cash Payment", icon: Banknote },
														{ id: "GPAY", label: "Google Pay", icon: CreditCard },
														{ id: "OTHER_UPI", label: "Other UPI", icon: QrCode },
													].map((mode) => (
														<label
															key={mode.id}
															className={`flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all cursor-pointer ${
																paymentMode === mode.id
																	? "bg-primary/10 border-primary shadow-lg scale-[1.02]"
																	: "bg-white border-primary/10 hover:border-primary/40"
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
																className={`h-14 w-14 rounded-2xl flex items-center justify-center shadow-sm ${
																	paymentMode === mode.id
																		? "bg-primary text-primary-foreground"
																		: "bg-primary/10 text-primary"
																}`}
															>
																<mode.icon className="h-7 w-7" />
															</div>
															<span
																className={`text-sm font-bold uppercase tracking-wider ${
																	paymentMode === mode.id ? "text-primary" : "text-foreground/70"
																}`}
															>
																{mode.label}
															</span>
														</label>
													))}
												</div>
											</div>

											{paymentMode !== "CASH" && (
												<div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-500">
													<div className="p-10 bg-primary/5 border-2 border-primary/20 rounded-[3rem] space-y-8 text-center shadow-inner">
														<p className="text-sm font-bold text-primary uppercase tracking-wider">
															Sacred Scan to Pay
														</p>
														{(() => {
															const displayQr = (tour.qr_code_url && tour.qr_code_url.startsWith("http"))
																? tour.qr_code_url
																: defaultQrCode;

															return displayQr ? (
																<div className="bg-white p-8 rounded-[2.5rem] shadow-2xl inline-block mx-auto border border-primary/20 hover:scale-105 transition-transform duration-500">
																	<img
																		src={displayQr}
																		alt="Payment QR Code"
																		className="h-64 w-64 object-contain"
																	/>
																</div>
															) : (
																<div className="h-64 w-64 mx-auto bg-primary/10 border-2 border-dashed border-primary/30 rounded-[2.5rem] flex flex-col items-center justify-center p-10 gap-6 opacity-80">
																	<QrCode className="h-14 w-14 text-primary" />
																	<p className="text-xs font-bold text-primary uppercase tracking-widest leading-relaxed">
																		QR Code setup in progress.
																	</p>
																</div>
															);
														})()}
														<p className="text-xs text-foreground/70 font-bold uppercase tracking-[0.1em] bg-white/50 py-3 rounded-full">
															Please save your payment screenshot.
														</p>
													</div>
												</div>
											)}

											<div className="space-y-6">
												<label className="text-[12px] font-bold text-foreground/60 uppercase tracking-wider ml-4">
													Sacred Requests / Notes
												</label>
												<textarea
													name="notes"
													className="w-full min-h-[200px] p-10 bg-white border border-primary/30 rounded-[3rem] text-xl font-sans text-foreground/80 focus:ring-4 focus:ring-primary/20 transition-all outline-none resize-none shadow-sm font-medium"
													placeholder="Special prayers or needs for your journey?"
												></textarea>
											</div>

											<Button
												type="submit"
												size="lg"
												className={cn(
													"w-full h-28 rounded-full text-base font-bold uppercase tracking-wider shadow-2xl transition-all",
													isFull
														? "bg-amber-600 text-white shadow-amber-900/30 hover:bg-amber-700"
														: "bg-primary text-primary-foreground shadow-primary/30 hover:bg-primary/90 hover:scale-[1.03]",
												)}
												disabled={isRegistering}
											>
												{isRegistering ? (
													<Loader2 className="animate-spin mr-4 h-10 w-10" />
												) : isFull ? (
													"Join The Waitlist"
												) : (
													"Join This Pilgrimage"
												)}
											</Button>

											<p className="text-center text-xs text-foreground/60 font-bold uppercase tracking-wider">
												Limited to {tour.max_participants || 20} pilgrims only
											</p>
										</Form>
									) : (
										<div className="text-center p-16 bg-red-500/5 rounded-[3rem] border border-red-500/20 font-bold text-red-600 uppercase tracking-[0.3em] text-sm leading-relaxed shadow-inner">
											Journey Registration is Currently {tour.status?.replace("_", " ")}
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
		REGISTRATION_OPEN: "text-emerald-600 border-emerald-600/30 bg-emerald-600/10",
		PUBLISHED: "text-primary border-primary/30 bg-primary/10",
		REGISTRATION_CLOSED: "text-red-600 border-red-600/30 bg-red-600/10",
		DRAFT: "text-slate-500 border-slate-500/30 bg-slate-500/10",
	};
	return (
		<Badge
			className={`px-5 py-2 rounded-full border-2 font-bold text-[10px] uppercase tracking-[0.25em] shadow-sm ${variants[status] || ""}`}
		>
			{status?.replace("_", " ")}
		</Badge>
	);
}
