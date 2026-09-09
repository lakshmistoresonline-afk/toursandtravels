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
	Clock,
	MapPin,
	Users,
	Loader2,
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

	if (!tour) return <div className="container py-20 text-center">Tour not found</div>;

	const tour_images = useMemo(() => {
		const filteredImages = tour?.images?.filter((i: string | null) => i != null) ?? [];
		return [
			{ url: tour.cover_image, title: tour.name + " Cover" },
			...filteredImages.map((url: string, idx: number) => ({
				url,
				title: tour.name + " Image " + idx,
			})),
		];
	}, [tour]);

	const isRegistering = navigation.state === "submitting" && navigation.formData?.get("intent") === "register";
	const isRegistrationOpen = tour.status === "REGISTRATION_OPEN" || tour.status === "PUBLISHED";

	return (
		<>
			<MetaDetails
				metaTitle={tour.name + " | WanderNest"}
				metaDescription={tour.overview?.slice(0, 320)}
			/>

			<div className="container mx-auto py-8 space-y-8 px-4">
				<div className="space-y-4">
					<div className="flex justify-between items-start flex-wrap gap-4">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<Badge variant="outline" className="font-mono">{tour.tour_code}</Badge>
								<TourStatusBadge status={tour.status!} />
							</div>
							<h1 className="text-4xl font-bold">{tour.name}</h1>
							<div className="flex items-center gap-2 text-muted-foreground mt-2">
								<MapPin className="h-4 w-4" />
								<span>{tour.destination}</span>
							</div>
						</div>
						<div className="text-right">
							<div className="text-sm text-muted-foreground">Price per person</div>
							<div className="text-3xl font-bold text-primary">{tour.price?.toLocaleString()} AED</div>
						</div>
					</div>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					<div className="lg:col-span-2 space-y-10">
						<TourImageCarousel images={tour_images} />

						<div className="space-y-6">
							<h2 className="text-2xl font-bold border-b pb-2">Overview</h2>
							<p className="text-lg leading-relaxed text-muted-foreground whitespace-pre-wrap">{tour.overview}</p>
						</div>

						{tour.itinerary && tour.itinerary.length > 0 && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold border-b pb-2">Itinerary</h2>
								<div className="space-y-6">
									{tour.itinerary.map((day: any) => (
										<div key={day.id} className="flex gap-6">
											<div className="flex flex-col items-center">
												<div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
													{day.day_number}
												</div>
												<div className="flex-1 w-0.5 bg-muted mt-2"></div>
											</div>
											<div className="space-y-2 pb-6">
												<h3 className="text-xl font-semibold">{day.title}</h3>
												<p className="text-muted-foreground">{day.description}</p>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>

					<div className="space-y-6">
						<Card className="sticky top-24">
							<CardHeader>
								<CardTitle>Register for this Tour</CardTitle>
								<CardDescription>Secure your spot in few clicks.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-6">
								<div className="space-y-3 text-sm">
									<div className="flex justify-between">
										<span className="text-muted-foreground flex items-center gap-2"><Calendar className="h-4 w-4" /> Start Date</span>
										<span className="font-medium">{tour.start_date || 'TBD'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Max Capacity</span>
										<span className="font-medium">{tour.max_participants || "Unlimited"}</span>
									</div>
								</div>

								<Separator />

								{!user ? (
									<div className="space-y-4">
										<p className="text-sm text-center text-muted-foreground">Please login to register.</p>
										<Button asChild className="w-full"><Link to="/login">Login / Sign Up</Link></Button>
									</div>
								) : isRegistrationOpen ? (
									<Form method="post" className="space-y-4">
										<input type="hidden" name="intent" value="register" />
										<div className="space-y-2">
											<label className="text-sm font-medium">Number of Travellers</label>
											<Input type="number" name="travellersCount" defaultValue={1} min={1} max={tour.max_participants || 50} />
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">Special Notes</label>
											<textarea name="notes" className="w-full min-h-[80px] p-2 border rounded-md text-sm" placeholder="Optional notes..."></textarea>
										</div>
										<div className="bg-muted p-3 rounded-lg text-xs space-y-1">
											<p className="font-semibold text-primary uppercase tracking-wider">Quick Profile Reuse</p>
											<p>Details for <strong>{user.first_name} {user.last_name}</strong> will be used.</p>
											<Link to="/account/details" className="text-primary hover:underline font-medium">Manage profile</Link>
										</div>
										<Button type="submit" className="w-full" size="lg" disabled={isRegistering}>
											{isRegistering ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Join Tour"}
										</Button>
									</Form>
								) : (
									<div className="text-center p-4 bg-muted rounded-lg font-medium text-destructive">
										Registration is {tour.status?.replace('_', ' ').toLowerCase()}.
									</div>
								)}
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}

function TourStatusBadge({ status }: { status: string }) {
	const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
		PUBLISHED: "secondary",
		REGISTRATION_OPEN: "default",
		REGISTRATION_CLOSED: "destructive",
		DRAFT: "outline",
	};
	return <Badge variant={variants[status] || "outline"} className="capitalize">{status?.replace('_', ' ').toLowerCase()}</Badge>;
}

function Input({ ...props }: any) {
	return <input className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" {...props} />;
}
