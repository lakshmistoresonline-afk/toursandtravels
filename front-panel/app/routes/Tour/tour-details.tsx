import {
	Await,
	Form,
	Link,
	type LoaderFunctionArgs,
	useActionData,
	useLoaderData,
	useNavigation,
} from "react-router";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { format } from "date-fns";
import {
	Calendar,
	Check,
	Clock,
	MapPin,
	Users,
	Loader2,
} from "lucide-react";
import { memo, useMemo, useEffect } from "react";
import TourImageCarousel from "~/components/Tour/TourImageCarousel";
import { Separator } from "~/components/ui/separator";
import { tourDetailsQuery } from "~/queries/tours.q";
import type { GetTourDetails } from "@workspace/shared/types/tours";
import { cn } from "@workspace/shared/utils/ui";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { SUPABASE_IMAGE_BUCKET_PATH } from "@workspace/shared/constants/constants";
import { Badge } from "~/components/ui/badge";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { BookingService } from "@workspace/shared/services/booking.service";
import { toast } from "sonner";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
	if (!params.id) return null;
	const tour = await tourDetailsQuery({ request, tour_id: params.id });
	const userData = await getCurrentUser(request);
	return { tour, userData };
};

export const action = async ({ request, params }: any) => {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "register") {
		const bookingSvc = new BookingService(request);
		const travellersCount = Number(formData.get("travellersCount") || 1);
		const notes = formData.get("notes")?.toString();

		try {
			const regId = await bookingSvc.createRegistration(params.id, travellersCount, notes);
			return { success: true, regId };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}
	return null;
};

export default function TourDetailsPage() {
	const loaderData = useLoaderData<typeof loader>();
	const actionData = useActionData();
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
			...filteredImages.map((j: string, idx: number) => ({
				url: j,
				title: tour.name + " Secondary Image " + idx,
			})),
		];
	}, [tour]);

	const isRegistering = navigation.state === "submitting" && navigation.formData?.get("intent") === "register";
	const isRegistrationOpen = tour.status === "REGISTRATION_OPEN" || tour.status === "PUBLISHED";

	return (
		<>
			<MetaDetails
				metaTitle={(tour.meta_details?.meta_title ?? tour.name) + " | WanderNest"}
				metaDescription={tour.meta_details?.meta_description ?? tour.overview?.slice(0, 320)}
				ogImage={SUPABASE_IMAGE_BUCKET_PATH + "/" + tour.cover_image}
			/>

			<div className="container mx-auto py-8 space-y-8">
				{/* Header Section */}
				<div className="space-y-4">
					<div className="flex justify-between items-start">
						<div>
							<div className="flex items-center gap-3 mb-2">
								<Badge variant="outline" className="font-mono">{tour.tour_code}</Badge>
								<TourStatusBadge status={tour.status} />
							</div>
							<h1 className="text-4xl font-bold">{tour.name}</h1>
							<div className="flex items-center gap-2 text-muted-foreground mt-2">
								<MapPin className="h-4 w-4" />
								<span>{tour.destination}</span>
							</div>
						</div>
						<div className="text-right">
							<div className="text-sm text-muted-foreground">Price per person</div>
							<div className="text-3xl font-bold text-primary">{tour.price.toLocaleString()} AED</div>
						</div>
					</div>
				</div>

				<div className="grid lg:grid-cols-3 gap-8">
					{/* Main Content */}
					<div className="lg:col-span-2 space-y-10">
						<TourImageCarousel images={tour_images} />

						<div className="space-y-6">
							<h2 className="text-2xl font-bold border-b pb-2">Overview</h2>
							<p className="text-lg leading-relaxed text-muted-foreground">{tour.overview}</p>
						</div>

						{tour.itinerary && tour.itinerary.length > 0 && (
							<div className="space-y-6">
								<h2 className="text-2xl font-bold border-b pb-2">Itinerary</h2>
								<div className="space-y-6">
									{tour.itinerary.sort((a, b) => a.day_number - b.day_number).map((day) => (
										<div key={day.id} className="flex gap-6">
											<div className="flex flex-col items-center">
												<div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
													{day.day_number}
												</div>
												<div className="flex-1 w-0.5 bg-muted mt-2"></div>
											</div>
											<div className="space-y-2 pb-6">
												<h3 className="text-xl font-semibold">{day.title}</h3>
												{day.departure_time && (
													<div className="flex items-center gap-1 text-sm text-muted-foreground">
														<Clock className="h-3 w-3" /> {day.departure_time}
													</div>
												)}
												<p className="text-muted-foreground">{day.description}</p>
												{day.activities && (
													<div className="text-sm">
														<strong>Activities:</strong> {day.activities}
													</div>
												)}
												{day.meals && (
													<div className="text-sm">
														<strong>Meals:</strong> {day.meals}
													</div>
												)}
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{tour.highlights && (
							<div className="space-y-4">
								<h2 className="text-2xl font-bold border-b pb-2">Highlights</h2>
								<div className="prose prose-sm max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: tour.highlights }}></div>
							</div>
						)}
					</div>

					{/* Sidebar / Registration */}
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
										<span className="font-medium">{tour.start_date ? format(new Date(tour.start_date), "PPP") : 'TBD'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground flex items-center gap-2"><Clock className="h-4 w-4" /> End Date</span>
										<span className="font-medium">{tour.end_date ? format(new Date(tour.end_date), "PPP") : 'TBD'}</span>
									</div>
									<div className="flex justify-between">
										<span className="text-muted-foreground flex items-center gap-2"><Users className="h-4 w-4" /> Max Capacity</span>
										<span className="font-medium">{tour.max_participants || "Unlimited"}</span>
									</div>
								</div>

								<Separator />

								{!user ? (
									<div className="space-y-4">
										<p className="text-sm text-center text-muted-foreground">Please login to register for this tour.</p>
										<Button asChild className="w-full">
											<Link to="/login">Login / Sign Up</Link>
										</Button>
									</div>
								) : isRegistrationOpen ? (
									<Form method="post" className="space-y-4">
										<input type="hidden" name="intent" value="register" />
										<div className="space-y-2">
											<label className="text-sm font-medium">Number of Travellers</label>
											<input
												type="number"
												name="travellersCount"
												defaultValue={1}
												min={1}
												max={tour.max_participants || 10}
												className="w-full flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											/>
										</div>
										<div className="space-y-2">
											<label className="text-sm font-medium">Special Notes (Optional)</label>
											<textarea
												name="notes"
												placeholder="Any dietary requirements or special requests?"
												className="w-full flex min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
											></textarea>
										</div>
										<div className="bg-muted p-3 rounded-lg text-xs space-y-1">
											<p className="font-semibold">Quick Profile Reuse:</p>
											<p>We'll use your saved profile details ({user.first_name} {user.last_name}) for this registration.</p>
											<Link to="/account/details" className="text-primary hover:underline">Update profile if needed</Link>
										</div>
										<Button type="submit" className="w-full" size="lg" disabled={isRegistering}>
											{isRegistering ? (
												<>
													<Loader2 className="mr-2 h-4 w-4 animate-spin" />
													Processing...
												</>
											) : (
												"Join Tour"
											)}
										</Button>
									</Form>
								) : (
									<div className="text-center p-4 bg-muted rounded-lg">
										<p className="font-semibold text-destructive">Registration is currently {tour.status?.replace('_', ' ').toLowerCase()}.</p>
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
		UPCOMING: "secondary",
		ONGOING: "default",
		COMPLETED: "outline",
		CANCELLED: "destructive",
	};

	return (
		<Badge variant={variants[status] || "outline"} className="capitalize">
			{status?.replace('_', ' ').toLowerCase()}
		</Badge>
	);
}

function AddToFavouriteBtn({ tour_id }: { tour_id: string }) {
	return null; // Simplified for now
}
													<CardContent>
														<div>
															{getUpcomingAvailableDates(option, 3).length ==
																0 &&
																((option.availability_rules ?? []).every(
																	(a) =>
																		(a.time_slots ?? []).every(
																			(s) =>
																				availability.find(
																					(a) => a.id === s.id,
																				)?.available_seats,
																		),
																) ||
																	option.availability_rules.length ==
																		0) && (
																	<p className="text-destructive">
																		Not Available
																	</p>
																)}

															{(() => {
																const upcomingDates =
																	getUpcomingAvailableDates(
																		option,
																		isMobile ? 3 : 6,
																	);

																if (
																	upcomingDates.length === 0 ||
																	upcomingDates.length < 3 ||
																	tour.tour_options.every(
																		(i) => i.isOpenDated === true,
																	)
																) {
																	return <></>;
																}

																return (
																	<div className="space-y-2">
																		<h2 className="text-muted-foreground text-xs">
																			Next Available Dates
																		</h2>
																		<div className="flex flex-wrap gap-2">
																			{upcomingDates.map(
																				({ date, formatted }) => (
																					<div
																						key={formatted}
																						className="cursor-pointer hover:bg-primary/10 transition-colors py-4 px-5 flex flex-col gap-1 items-center justify-center bg-muted rounded-lg"
																						onClick={() => {
																							handleDateSelect(
																								date,
																							);
																							handleButtonClick(
																								option,
																							);
																						}}
																					>
																						<Calendar className="w-4 h-4 text-muted-foreground" />
																						<div className="text-center">
																							<p className="text-sm">
																								{formatted.split(
																									" ",
																								)[0] +
																									" " +
																									formatted.split(
																										" ",
																									)[1]}
																							</p>
																							<p className="text-[0.7rem]">
																								{
																									formatted.split(
																										" ",
																									)[2]
																								}
																							</p>
																						</div>
																					</div>
																				),
																			)}
																			{upcomingDates.length ===
																				(isMobile ? 3 : 6) && (
																				<div
																					className="cursor-pointer hover:bg-primary/10 transition-colors py-4 px-5 flex flex-col gap-1 items-center justify-center bg-muted rounded-lg text-sm"
																					onClick={() =>
																						handleButtonClick(
																							option,
																						)
																					}
																				>
																					<CalendarPlusIcon className="w-4 h-4 text-muted-foreground" />
																					<p className="text-sm">
																						More
																					</p>
																				</div>
																			)}
																		</div>
																	</div>
																);
															})()}
														</div>
													</CardContent>
													{getUpcomingAvailableDates(option, 6).length > 3 &&
														tour.tour_options.every(
															(i) => i.isOpenDated === false,
														) && <Separator />}
													<CardContent>
														<div className="flex gap-4 flex-wrap mt-6">
															{/* View Details Dialog */}
															<Dialog>
																<DialogTrigger asChild>
																	<Button variant={"outline"} size={"sm"}>
																		View Details
																	</Button>
																</DialogTrigger>
																<DialogContent className="max-w-xl max-h-[min(600px,80vh)] overflow-y-auto">
																	<DialogHeader className="mb-2">
																		<DialogTitle>
																			Option Details
																		</DialogTitle>
																	</DialogHeader>
																	<div className="bg-accent p-4 rounded-lg">
																		<h3 className="font-semibold text-base">
																			{tour.name}
																		</h3>
																		<p className="text-sm">
																			{option.name}
																		</p>
																	</div>
																	<div>
																		<MainBodySection
																			content={option.inclusions}
																			title="Inclusions"
																			titleClassName="text-lg"
																			containerClassName="[&>ul]:mt-1"
																		/>
																		<MainBodySection
																			content={option.exclusions}
																			title="Exclusions"
																			titleClassName="text-lg"
																			containerClassName="[&>ul]:mt-1"
																		/>
																		<MainBodySection
																			content={option.note}
																			title="Special Note"
																			titleClassName="text-lg"
																			containerClassName="[&>ul]:mt-1"
																		/>
																		<div className="flex gap-2 justify-between items-center pt-6 pb-2 border-t mt-5">
																			<p className="text-lg font-semibold">
																				From {getMinPrice(option)} AED
																			</p>
																			<Button
																				size={"icon"}
																				onClick={() =>
																					handleButtonClick(option)
																				}
																			>
																				<ArrowRight className="w-4 h-4" />
																			</Button>
																		</div>
																	</div>
																</DialogContent>
															</Dialog>
															<div className="w-fit ml-auto">
																<Button
																	onClick={() => handleButtonClick(option)}
																	size={"sm"}
																>
																	Select
																</Button>
															</div>
															<Dialog
																onOpenChange={() => {
																	setSelectedDate(undefined);
																	setStepsDialogOpen(false);
																	const newUrl = new URL(
																		window.location.href,
																	);
																	newUrl.searchParams.delete("optionId");
																	newUrl.searchParams.delete("date");
																	window.history.replaceState(
																		{},
																		"",
																		newUrl.toString(),
																	);
																}}
																open={stepsDialogOpen}
															>
																<DialogContent className="max-w-lg">
																	<DialogHeader className="mb-2">
																		<DialogTitle>
																			Select your preferences
																		</DialogTitle>
																	</DialogHeader>
																	{/* Secondary Header */}
																	<div className="bg-accent p-4 rounded-lg space-y-2">
																		<h3 className="font-semibold text-base">
																			{tour.name}
																		</h3>
																		<div className="space-y-1">
																			{selectedOption && (
																				<p className="text-sm">
																					{selectedOption.name}
																				</p>
																			)}
																			{step === "time" &&
																				selectedDate && (
																					<div className="flex gap-2 items-center justify-between">
																						<p className="text-sm mt-1">
																							{format(
																								selectedDate,
																								"PPPP",
																							)}
																						</p>
																						<Button
																							type="button"
																							size={"sm"}
																							variant={"ghost"}
																							onClick={
																								handleBack
																							}
																							className="cursor-pointer flex gap-2"
																						>
																							<Edit className="w-4 h-4 " />
																							<span className="text-sm">
																								Edit Date
																							</span>
																						</Button>
																					</div>
																				)}
																			{step === "participants" &&
																				selectedDate &&
																				selectedTimeSlot && (
																					<div className="space-y-1">
																						<p className="text-sm">
																							{format(
																								selectedDate,
																								"PPPP",
																							)}
																						</p>
																						<div className="flex gap-2 items-center justify-between">
																							<p className="text-sm">
																								{
																									selectedTimeSlot.label
																								}
																							</p>
																							<button
																								type="button"
																								onClick={
																									handleBack
																								}
																								className="cursor-pointer flex gap-2"
																							>
																								<Edit className="w-4 h-4 " />
																								<span className="text-sm">
																									Edit
																									TimeSlot
																								</span>
																							</button>
																						</div>
																						{availability.length >
																							0 && (
																							<p className="text-sm">
																								{
																									availability.find(
																										(a) =>
																											a.id ===
																											selectedTimeSlot.id,
																									)
																										?.available_seats
																								}{" "}
																								seat(s)
																								available
																							</p>
																						)}
																					</div>
																				)}
																		</div>
																	</div>
																	{step === "date" && selectedOption && (
																		<div className="space-y-4">
																			<p>
																				Select{" "}
																				{selectedOption?.isOpenDated
																					? "your preffered date"
																					: "a date"}
																			</p>
																			{[
																				{
																					className:
																						"max-[32rem]:hidden",
																					months: 2,
																					align: "center",
																				},
																				{
																					className:
																						"max-[32rem]:block hidden",
																					months: 1,
																					align: "start",
																				},
																			].map(
																				(
																					{
																						className,
																						months,
																						align,
																					},
																					i,
																				) => (
																					<div
																						className={className}
																						key={i}
																					>
																						<DatePicker
																							popover_align={
																								align as any
																							}
																							numberOfMonths={
																								months
																							}
																							value={
																								selectedDate
																							}
																							onDateChange={
																								handleDateSelect
																							}
																							defaultMonth={
																								selectedDate ||
																								new Date()
																							}
																							date_disabled={(
																								date,
																							) => {
																								if (
																									isBefore(
																										date,
																										startOfToday(),
																									)
																								)
																									return true;

																								return !isDateCoveredByAnyRule(
																									date,
																									selectedOption,
																								);
																							}}
																						/>
																					</div>
																				),
																			)}
																			{selectedDate &&
																				getTimeSlotsForDate(
																					selectedDate,
																					selectedOption,
																				).length === 0 && (
																					<p className="text-destructive">
																						No available time
																						slots for this date.
																					</p>
																				)}
																			<div className="w-fit ml-auto">
																				<Button
																					size={"sm"}
																					onClick={
																						handleDateNextClick
																					}
																					disabled={
																						(selectedDate &&
																							getTimeSlotsForDate(
																								selectedDate,
																								selectedOption,
																							).length === 0) ||
																						!selectedDate
																					}
																				>
																					Next
																				</Button>
																			</div>
																		</div>
																	)}
																	{step === "time" &&
																		selectedDate &&
																		selectedOption && (
																			<div className="space-y-4">
																				<p>
																					Select{" "}
																					{selectedOption?.isOpenDated
																						? "your preffered timeslot"
																						: "a timeslot"}
																				</p>
																				<div className="flex gap-2 flex-wrap">
																					{isLoadingSlots ? (
																						<>
																							<Skeleton className="h-10 w-28 rounded-md" />
																							<Skeleton className="h-10 w-28 rounded-md" />
																							<Skeleton className="h-10 w-28 rounded-md" />
																						</>
																					) : (
																						updatedTimeSlots.map(
																							(slot) => {
																								const seats =
																									slot.capacity;
																								const disabled =
																									seats <=
																										0 ||
																									!slot.is_active;

																								return (
																									<Button
																										key={
																											slot.id
																										}
																										variant="secondary"
																										className={cn(
																											"w-fit min-w-25",
																											disabled
																												? "opacity-60 cursor-not-allowed pointer-events-none"
																												: "border-2 border-primary hover:bg-primary/10",
																										)}
																										onClick={() =>
																											handleTimeSelect(
																												slot,
																											)
																										}
																										disabled={
																											disabled
																										}
																									>
																										{
																											slot.label
																										}
																										{` (${seats})`}
																									</Button>
																								);
																							},
																						)
																					)}
																				</div>
																			</div>
																		)}
																	{step === "participants" &&
																		selectedOption &&
																		selectedTimeSlot &&
																		selectedDate && (
																			<ParticipantFormComponent
																				option={selectedOption}
																				selectedTimeSlot={{
																					...selectedTimeSlot,
																					capacity:
																						selectedTimeSlot.capacity,
																				}}
																				selectedDate={selectedDate}
																			/>
																		)}
																</DialogContent>
															</Dialog>
														</div>
													</CardContent>
												</Card>
											);
										})}
								</div>
								{/* Sections */}
								<section>
									<h2 className="text-2xl font-semibold">Overview</h2>
									<p className="mt-4">{tour.overview}</p>
								</section>
								<MainBodySection title="Highlights" content={tour.highlights} />
								<MainBodySection
									title="Know Before You Go"
									content={tour.know_before_you_go}
								/>
								<MainBodySection
									title="Age and Health Restrictions"
									content={tour.age_health_restrictions}
								/>
								{tour.cancellation_policy_detail &&
									tour.cancellation_policy_detail.policy && (
										<section id="cancellation-policy">
											<h2 className="text-2xl font-semibold">Cancellation Policy</h2>
											<p className="mt-4">{tour.cancellation_policy_detail.policy}</p>
										</section>
									)}
								{tour.address_name && tour.address_link && (
									<section>
										<h2 className="text-2xl font-semibold">Location</h2>
										<div className="mt-4 flex gap-2 items-center">
											<MapPinned className="h-4 w-4" />
											<a
												href={"https://google.com/search?q=" + tour.address_name}
												target={"_blank"}
												className="underline-offset-4 hover:underline hover:text-primary focus:outline-0 focus:underline focus:underline-offset-4 focus:text-primary"
											>
												{tour.address_name}
											</a>
										</div>
										<Suspense>
											<Await
												resolve={tour}
												children={(tour) =>
													tour.address_link && (
														<iframe
															src={tour.address_link}
															width="100%"
															height="400"
															style={{
																border: "0",
																borderRadius: "10px",
																marginTop: "1rem",
															}}
															allowFullScreen
															loading="lazy"
															referrerPolicy="no-referrer-when-downgrade"
														></iframe>
													)
												}
											/>
										</Suspense>
									</section>
								)}
							</div>
						</div>
						{/* Right side */}
						<section className="max-lg:hidden">
							<AttributesCard className="sticky top-10" tour={tour} />
						</section>
					</div>
					{tour.tags && tour.tags.length > 0 && (
						<section>
							<h2 className="text-2xl font-semibold">Related Tags</h2>
							<div className="flex gap-2 flex-wrap mt-4">
								{tour.tags.map((tag, i) => (
									<Link
										key={tag.id}
										viewTransition
										prefetch="intent"
										to={`/tours?tags=${tag.id}`}
									>
										<div className="relative">
											<div className="flex gap-2 items-center pr-6 bg-card rounded-md">
												<div className="px-4 bg-primary py-2 rounded-l-md">
													<p className="text-white">{i + 1}</p>
												</div>
												<p className="text-base py-2">{tag.name}</p>
											</div>
										</div>
									</Link>
								))}
							</div>
						</section>
					)}
				</div>
			</section>
			{loaderData && (
				<Suspense fallback={<TourReviewsSkeleton />}>
					<Await
						resolve={loaderData.reviewsData}
						children={(reviewsData) => (
							<section className="py-20">
								<TourReviews
									reviews={reviewsData.reviews}
									average_rating={reviewsData.stats.average_rating}
									total_reviews={reviewsData.stats.total_reviews}
									rating_counts={reviewsData.stats.rating_counts}
									currentPage={loaderData.currentReviewPage}
									hasMore={reviewsData.reviews.length === REVIEWS_PAGE_SIZE}
								/>
							</section>
						)}
					/>
				</Suspense>
			)}
			<section className="py-20 space-y-10">
				<section>
					<RelatedTours
						tours={loaderData?.relatedToursByCity ?? []}
						title={"Exlore More in " + tour.city?.name}
					/>
				</section>
				<section>
					<RelatedTours
						tours={loaderData?.relatedToursByCategory ?? []}
						title={"See Related Tours"}
					/>
				</section>
			</section>
		</>
	);
}

const ParticipantFormComponent = memo(
	({
		option,
		selectedTimeSlot,
		selectedDate,
	}: {
		option: TourDetailOption;
		selectedTimeSlot: AvailabilitySlot;
		selectedDate: Date;
	}) => {
		const navigate = useNavigate();
		const loaderData = useLoaderData<typeof loader>();

		const { control, handleSubmit, getValues } = useForm<ParticipantForm>({
			resolver: zodResolver(participantSchema),
			defaultValues: {
				quantities: option.prices.reduce((acc: Record<number, number>, price) => {
					acc[price.participant_type.id] = 0;
					return acc;
				}, {}),
			},
		});

		const quantities = useWatch({ control, name: "quantities" });
		const [isAddingToCart, setIsAddingToCart] = useState(false);

		function calculatePrice() {
			return Object.entries(quantities).reduce((sum, [typeId, qty]) => {
				const price =
					option.prices.find((p: any) => p.participant_type.id === Number(typeId))?.price || 0;
				return sum + price * (Number(qty) || 0);
			}, 0);
		}

		const totalPrice = useMemo(() => calculatePrice(), [quantities, option]);

		const onSubmit = (data: ParticipantForm) => {
			if (loaderData == null || loaderData?.tour == null) {
				toast.error("Something went wrong. Please try again.");
			}

			if (Object.values(data.quantities).some((qty) => qty > 0) === false) {
				toast.error("Please select at least one participant.");
				return;
			}

			let availability_slots = loaderData?.availability;
			if (availability_slots && availability_slots.length > 0) {
				const available_seats =
					availability_slots.find((slot) => slot.id === selectedTimeSlot.id)?.available_seats ||
					selectedTimeSlot.capacity;

				let input_qty = 0;
				for (const key in data.quantities) {
					key in data.quantities && (input_qty += data.quantities[key]);
				}

				if (input_qty > available_seats) {
					toast.error(
						`There ${available_seats <= 1 ? "is" : "are"} only ${available_seats} available seat(s) for this time slot. Please select a different time slot or reduce the number of participants.`,
					);

					return;
				}
			}

			navigate("/booking", {
				state: {
					tour: loaderData?.tour,
					option,
					date: selectedDate,
					timeSlot: selectedTimeSlot,
					quantities: data.quantities,
				},
			});
		};

		const handleAddToCart = async () => {
			const currentQuantities = getValues("quantities");
			const userId = loaderData?.userData.user?.id;

			if (!userId) {
				toast.error("Please login to add to cart.");
				return;
			}

			setIsAddingToCart(true);

			try {
				const payload: AddToCartPayload = {
					user_id: userId,
					cart_items: [
						{
							tour_option_id: option.id,
							preferred_date: format(selectedDate, "yyyy-MM-dd"),
							preferred_timeslot: selectedTimeSlot.label,
							quantities: Object.entries(currentQuantities)
								.filter(([, qty]) => qty > 0)
								.map(([participant_type_id, quantity]) => ({
									participant_type_id: Number(participant_type_id),
									quantity: Number(quantity),
								})),
						},
					],
				};

				const res = await fetch("/add-to-cart", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify(payload),
				});

				const json = await res.json();

				if (json.success) {
					toast.success("Added to cart successfully!", {
						action: {
							label: "Go to cart",
							onClick: () => {
								navigate("/cart", {
									viewTransition: true,
								});
							},
						},
					});
				} else {
					toast.error(json.error || "Failed to add to cart");
				}
			} catch (error) {
				toast.error("Failed to add to cart");
				console.error(error);
			} finally {
				setIsAddingToCart(false);
			}
		};

		return (
			<form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
				<p>Select participants</p>
				{option.prices
					.sort((a, b) => b.participant_type.id - a.participant_type.id)
					.map(
						(
							price: Tables<"tour_option_prices"> & {
								participant_type: Tables<"participant_types">;
							},
						) => {
							const pt = price.participant_type;

							return (
								<div key={pt.id} className="flex gap-2 items-center justify-between">
									<div>
										<div className="flex gap-1">
											<Label
												htmlFor={`qty-${pt.id}`}
												className="font-semibold text-base"
											>
												<p>{pt.name}</p>
												<div>
													{pt.age_max - pt.age_min > 80 ? (
														<p>({pt.age_min}+)</p>
													) : pt.age_max === 0 && pt.age_min === 0 ? (
														<></>
													) : (
														<p>
															({pt.age_min}-{pt.age_max})
														</p>
													)}
												</div>
											</Label>
										</div>
										<p className="text-sm">{price.price} AED</p>
									</div>
									<div className="w-fit h-fit">
										<Controller
											name={`quantities.${pt.id}`}
											control={control}
											render={({ field }) => (
												<QuantityInput
													id={`qty-${pt.id}`}
													quantity={field.value ?? 0}
													min={0}
													max={selectedTimeSlot.capacity}
													step={1}
													onChange={(e) => field.onChange(Number(e))}
												/>
											)}
										/>
									</div>
								</div>
							);
						},
					)}
				<p className="font-semibold text-base mt-8">Total: {totalPrice.toFixed(2)} AED</p>

				<div className="flex justify-end">
					<Button
						type="button"
						variant="outline"
						onClick={handleAddToCart}
						disabled={isAddingToCart || Object.values(quantities).every((q) => q === 0)}
					>
						{isAddingToCart ? (
							<Loader2 className="h-4 w-4 animate-spin" />
						) : (
							<BadgePlus className="h-4 w-4" />
						)}
						<p className="my-auto">Add to Cart</p>
					</Button>
				</div>
			</form>
		);
	},
);

const AttributesCard = memo(
	({
		tour,
		className,
	}: {
		tour: GetTourDetails;
		className?: HtmlHTMLAttributes<HTMLDivElement>["className"];
	}) => {
		const loaderData = useLoaderData<typeof loader>();

		return (
			<Card className={cn("h-fit", className)}>
				<CardContent className="space-y-4">
					<div className="flex flex-col justify-center">
						<h2 className="text-xl font-semibold">
							From {Math.min(...tour.tour_options.map(getMinPrice))} AED
						</h2>
						<p className="text-muted-foreground text-sm">
							Per{tour.hasGroupPrice ? " Group" : " Person"}
						</p>
					</div>
				</CardContent>
				{(tour.free_cancelation_avilable !== null ||
					tour.duration_minutes !== null ||
					tour.live_tour_guide !== null ||
					(tour.live_tour_guide_langs !== null && tour.live_tour_guide_langs !== "")) && (
					<Separator />
				)}
				<CardContent className="space-y-2">
					{tour.free_cancelation_avilable && (
						<div className="flex items-center gap-4">
							<Check className="h-5 w-5 text-primary" />
							<div>
								<h3 className="font-semibold">Free Cancellation Available</h3>
								<a href="#cancellation-policy" className="underline-offset-4 hover:underline">
									<p className="text-muted-foreground text-sm">
										See cancellation policy for details
									</p>
								</a>
							</div>
						</div>
					)}
					{tour.duration_minutes && (
						<div className="flex items-center gap-4">
							<ClockFading className="h-5 w-5" />
							<div>
								<h3 className="font-semibold">
									Duration around {formatTourDurationHours(tour.duration_minutes)}
								</h3>
								<p className="text-muted-foreground text-sm">
									Check availability or contact us for starting times
								</p>
							</div>
						</div>
					)}
					{tour.isWeelChairAccessible && (
						<div className="flex items-center gap-4">
							<Accessibility className="h-5 w-5" />
							<div>
								<h3 className="font-semibold">Accessibility</h3>
								<p className="text-muted-foreground text-sm">
									{tour.name} tour is wheelchair accessible
								</p>
							</div>
						</div>
					)}
					{tour.live_tour_guide &&
						tour.live_tour_guide_langs != "" &&
						tour.live_tour_guide_langs != null && (
							<div className="flex items-center gap-4">
								<Check className="h-5 w-5 text-primary" />
								<div>
									<h3 className="font-semibold">Live Tour Guide Available</h3>
									<p className="text-muted-foreground text-sm">
										Languages include{" "}
										{tour.live_tour_guide_langs
											.split(",")
											.map(
												(lang: string, idx: number) =>
													`${lang}${idx === (tour?.live_tour_guide_langs as string).split(",").length - 1 ? "" : ","} `,
											)}
									</p>
								</div>
							</div>
						)}

					<a
						href={`https://wa.me/${CONTACT_NUMBER_1}?text=${encodeURIComponent(`Hi, I want to know more about the ${tour.name} tour availability.`)}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<Button className="w-full mt-4">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								viewBox="0 0 24 24"
								width="36"
								height="36"
								fill="#ffff"
							>
								<path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21c5.46 0 9.91-4.45 9.91-9.91c0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.23 8.23 0 0 1 2.41 5.83c0 4.54-3.7 8.23-8.24 8.23c-1.48 0-2.93-.39-4.19-1.15l-.3-.17l-3.12.82l.83-3.04l-.2-.32a8.2 8.2 0 0 1-1.26-4.38c.01-4.54 3.7-8.24 8.25-8.24M8.53 7.33c-.16 0-.43.06-.66.31c-.22.25-.87.86-.87 2.07c0 1.22.89 2.39 1 2.56c.14.17 1.76 2.67 4.25 3.73c.59.27 1.05.42 1.41.53c.59.19 1.13.16 1.56.1c.48-.07 1.46-.6 1.67-1.18s.21-1.07.15-1.18c-.07-.1-.23-.16-.48-.27c-.25-.14-1.47-.74-1.69-.82c-.23-.08-.37-.12-.56.12c-.16.25-.64.81-.78.97c-.15.17-.29.19-.53.07c-.26-.13-1.06-.39-2-1.23c-.74-.66-1.23-1.47-1.38-1.72c-.12-.24-.01-.39.11-.5c.11-.11.27-.29.37-.44c.13-.14.17-.25.25-.41c.08-.17.04-.31-.02-.43c-.06-.11-.56-1.35-.77-1.84c-.2-.48-.4-.42-.56-.43c-.14 0-.3-.01-.47-.01" />
							</svg>
							<span>Send Us A Message</span>
						</Button>
					</a>
				</CardContent>

				<Separator className="lg:hidden" />

				<CardContent className="flex justify-between flex-wrap gap-4">
					<Suspense fallback={<></>}>
						<Await
							resolve={loaderData?.reviewsData}
							children={(reviewsData) =>
								reviewsData?.stats.total_reviews &&
								reviewsData?.stats.total_reviews > 0 &&
								reviewsData?.stats.average_rating > 2 ? (
									<div className="flex items-center gap-2 lg:hidden">
										<div className="flex items-center">
											<Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
											<span className="ml-1.5 text-xl font-semibold">
												{reviewsData.stats.average_rating.toFixed(1)}
											</span>
										</div>
										<span className="text-muted-foreground">
											· {reviewsData?.stats.total_reviews} reviews
										</span>
									</div>
								) : null
							}
						/>
					</Suspense>
					<div className="lg:hidden flex gap-2 ml-auto w-fit">
						<AddToFavouriteBtn tour_id={tour.id} />
						<ShareDialog
							url={`www.wandernest.com/tours/tour/${tour.id}/${tour.meta_details?.url_key}`}
						/>
					</div>
				</CardContent>
			</Card>
		);
	},
);

const MainBodySection = memo(
	({
		title,
		content,
		titleClassName,
		containerClassName,
	}: {
		title: string;
		content: string | null;
		titleClassName?: HTMLAttributes<HTMLDivElement>["className"];
		containerClassName?: HTMLAttributes<HTMLDivElement>["className"];
	}) => {
		return content != null ? (
			<section
				className={cn(
					"[&>ul]:list-disc [&>ul]:space-y-2 [&>ul]:pl-4 [&>ul]:mt-4",
					containerClassName,
				)}
			>
				<h2 className={cn("text-2xl font-semibold", titleClassName)}>{title}</h2>
				<ul>
					{content
						?.split("\n")
						.filter((ln: string) => ln.trim())
						.map((ln: string, index: number) => (
							<li key={index}>{ln}</li>
						))}
				</ul>
			</section>
		) : null;
	},
);

function AddToFavouriteBtn({ tour_id }: { tour_id: string }) {
	const { isFavourite, toggle } = useFavourites();
	const active = isFavourite(tour_id);

	return (
		<Button
			variant="ghost"
			type="button"
			className={`group hover:bg-destructive/40! ${active ? "bg-destructive/40!" : ""}`}
			onClick={() => toggle(tour_id)}
		>
			<Heart
				className={`h-4 w-4 group-hover:text-destructive group-hover:fill-destructive ${
					active ? "text-destructive fill-destructive" : ""
				}`}
			/>
			<span className="mt-1 max-[28rem]:hidden">
				{active ? "Remove from Favourites" : "Add To Favourites"}
			</span>
		</Button>
	);
}
