import { zodResolver } from "@hookform/resolvers/zod";
import { AddTourActionSchema } from "@workspace/shared/schemas/tour.schema";
import { ToursService } from "@workspace/shared/services/tours.service";
import { BookingService } from "@workspace/shared/services/booking.service";
import {
	Loader2,
	Plus,
	Trash2,
	Info,
	MapPin,
	IndianRupee,
	Image as ImageIcon,
	Users,
	User,
} from "lucide-react";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
	type ActionFunctionArgs,
	type LoaderFunctionArgs,
	useActionData,
	useLoaderData,
	useNavigate,
	useNavigation,
	useSubmit,
} from "react-router";
import { toast } from "sonner";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Button } from "~/components/ui/button";
import { BackButton } from "~/components/ui/back-button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { format } from "date-fns";

export const clientAction = async ({ request, params }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const payloadRaw = formData.get("payload") as string;
		const payload = JSON.parse(payloadRaw);

		const svc = new ToursService();
		await svc.updateTour(params.id!, payload);

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
	const svc = new ToursService();
	const bookingSvc = new BookingService();
	const tour = await svc.getTourDetails(params.id!);
	const registrations = await bookingSvc.getTourRegistrations(params.id!);
	return { tour, registrations };
};

export default function UpdateTourPage() {
	const { tour, registrations } = useLoaderData<typeof clientLoader>();
	const navigate = useNavigate();
	const submit = useSubmit();
	const navigation = useNavigation();
	const actionData = useActionData() as any;

	const form = useForm<any>({
		resolver: zodResolver(AddTourActionSchema),
		defaultValues: {
			tour_code: tour?.tour_code || "",
			name: tour?.name || "",
			overview: tour?.overview || "",
			destination: tour?.destination || "",
			price: tour?.price || 0,
			max_participants: tour?.max_participants || 20,
			status: tour?.status || "DRAFT",
			start_date: tour?.start_date || "",
			start_time: tour?.start_time || "",
			end_date: tour?.end_date || "",
			end_time: tour?.end_time || "",
			itinerary: tour?.itinerary || [],
			cover_image: tour?.cover_image || "",
			qr_code_url: tour?.qr_code_url || "",
		},
	});

	const { control, handleSubmit } = form;
	const { fields, append, remove } = useFieldArray({ control, name: "itinerary" });

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Spiritual journey updated successfully!");
			navigate("/admin/tours");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData, navigate]);

	const onSubmit = (values: any) => {
		const formData = new FormData();
		formData.append("payload", JSON.stringify(values));
		submit(formData, { method: "post" });
	};

	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-5xl mx-auto pb-32">
			<MetaDetails
				metaTitle="Update Journey | AMBADY Admin"
				metaDescription="Modify the details of your initiated experience."
			/>

			<div className="flex items-center justify-between border-b border-primary/10 pb-8">
				<div className="flex items-center gap-4">
					<BackButton fallbackUrl="/admin/tours" />
					<div>
						<h1 className="text-4xl font-serif text-foreground tracking-tight leading-tight">
							Update Journey
						</h1>
						<p className="text-foreground/40 mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
							Modify the details of your initiated experience.
						</p>
					</div>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
					{/* Basic Information */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<Info className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								General Information
							</h3>
						</div>
						<CardContent className="p-10 space-y-10">
							<div className="grid md:grid-cols-2 gap-10">
								<FormField
									control={control}
									name="name"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Journey Title
											</FormLabel>
											<FormControl>
												<Input
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="tour_code"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Journey Code
											</FormLabel>
											<FormControl>
												<Input
													className="h-14 rounded-2xl border-primary/10 bg-primary/5 text-primary font-mono font-bold px-6 shadow-none pointer-events-none"
													{...field}
													readOnly
													tabIndex={-1}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid md:grid-cols-2 gap-10">
								<FormField
									control={control}
									name="destination"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Primary Destination
											</FormLabel>
											<FormControl>
												<Input
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="status"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Registration Status
											</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus:ring-primary/20 shadow-sm">
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-white border-primary/20 text-foreground">
													<SelectItem value="DRAFT">Draft</SelectItem>
													<SelectItem value="PUBLISHED">Published</SelectItem>
													<SelectItem value="REGISTRATION_OPEN">
														Registration Open
													</SelectItem>
													<SelectItem value="REGISTRATION_CLOSED">
														Registration Closed
													</SelectItem>
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-2 md:grid-cols-4 gap-6">
								<FormField
									control={control}
									name="start_date"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Start Date
											</FormLabel>
											<FormControl>
												<Input
													type="date"
													className="h-12 rounded-xl border-primary/10 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm text-xs"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="start_time"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Start Time
											</FormLabel>
											<FormControl>
												<Input
													type="time"
													className="h-12 rounded-xl border-primary/10 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm text-xs"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="end_date"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												End Date
											</FormLabel>
											<FormControl>
												<Input
													type="date"
													className="h-12 rounded-xl border-primary/10 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm text-xs"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="end_time"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[9px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												End Time
											</FormLabel>
											<FormControl>
												<Input
													type="time"
													className="h-12 rounded-xl border-primary/10 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm text-xs"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Pricing & Capacity */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<IndianRupee className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Exchange & Capacity
							</h3>
						</div>
						<CardContent className="p-10 grid md:grid-cols-2 gap-10">
							<FormField
								control={control}
								name="price"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Base Price (INR)
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												className="h-16 rounded-2xl border-primary/20 bg-white text-primary font-serif text-3xl px-8 focus-visible:ring-primary/20 shadow-sm"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="max_participants"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Pilgrim Limit
										</FormLabel>
										<FormControl>
											<Input
												type="number"
												className="h-16 rounded-2xl border-primary/20 bg-white text-primary font-serif text-3xl px-8 focus-visible:ring-primary/20 shadow-sm"
												{...field}
												onChange={(e) => field.onChange(Number(e.target.value))}
											/>
										</FormControl>
										<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Itinerary */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center justify-between bg-primary/5">
							<div className="flex items-center gap-4">
								<MapPin className="h-4.5 w-4.5 text-primary" />
								<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
									Journey Roadmap
								</h3>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() =>
									append({ day_number: fields.length + 1, title: "", description: "" })
								}
								className="rounded-full border-primary/20 text-primary hover:bg-primary/5 text-[9px] font-bold uppercase tracking-widest px-6 h-10"
							>
								<Plus className="mr-2 h-3.5 w-3.5" /> Add Day
							</Button>
						</div>
						<CardContent className="p-10 space-y-12">
							{fields.map((field, index) => (
								<div
									key={field.id}
									className="relative p-10 rounded-[2.5rem] bg-primary/[0.02] border border-primary/10 space-y-8 animate-in zoom-in-95 duration-500 shadow-sm"
								>
									<div className="flex justify-between items-center">
										<Badge className="bg-primary text-primary-foreground border-none px-5 py-1.5 rounded-full font-serif text-sm shadow-sm">
											Day {index + 1}
										</Badge>
										<Button
											type="button"
											variant="ghost"
											size="icon"
											className="text-red-500 hover:bg-red-50 rounded-full h-10 w-10 p-0"
											onClick={() => remove(index)}
										>
											<Trash2 className="h-5 w-5" />
										</Button>
									</div>
									<div className="space-y-8">
										<FormField
											control={control}
											name={`itinerary.${index}.title`}
											render={({ field }) => (
												<FormItem className="space-y-3">
													<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
														Theme / Title
													</FormLabel>
													<FormControl>
														<Input
															placeholder="e.g. Spiritual Initiation"
															className="bg-white rounded-2xl border-primary/20 h-14 text-foreground font-bold text-base px-8 focus-visible:ring-primary/20 shadow-sm"
															{...field}
														/>
													</FormControl>
													<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
												</FormItem>
											)}
										/>
										<FormField
											control={control}
											name={`itinerary.${index}.description`}
											render={({ field }) => (
												<FormItem className="space-y-3">
													<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
														Experience Details
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder="Describe the day's journey..."
															className="bg-white rounded-[2rem] border-primary/20 min-h-[120px] p-6 text-foreground/70 text-sm leading-relaxed resize-none focus:ring-primary/20 shadow-sm"
															{...field}
														/>
													</FormControl>
													<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
												</FormItem>
											)}
										/>
									</div>
								</div>
							))}
						</CardContent>
					</Card>

					{/* Visual Artwork */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<ImageIcon className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Visual Identity & Assets
							</h3>
						</div>
						<CardContent className="p-10 space-y-10">
							<FormField
								control={control}
								name="cover_image"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Cover Image URL
										</FormLabel>
										<FormControl>
											<Input
												className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm px-8"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="qr_code_url"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Payment QR Code URL
										</FormLabel>
										<FormControl>
											<Input
												placeholder="Link to GPay/UPI QR code image"
												className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm px-8"
												{...field}
											/>
										</FormControl>
										<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<div className="flex justify-end pt-10">
						<Button
							type="submit"
							className="h-20 px-16 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.05] transition-all hover:bg-primary/90"
							disabled={isSubmitting}
						>
							{isSubmitting ? <Loader2 className="animate-spin mr-4 h-6 w-6" /> : null}
							Update Journey Details
						</Button>
					</div>
				</form>
			</Form>

			{/* Registered Pilgrims Section */}
			<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl mt-12">
				<div className="px-10 py-7 border-b border-primary/10 flex items-center justify-between bg-primary/5">
					<div className="flex items-center gap-4">
						<Users className="h-5 w-5 text-primary" />
						<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
							Registered Pilgrims
						</h3>
					</div>
					<Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-[10px] font-bold">
						{registrations.registrations.length} Total
					</Badge>
				</div>
				<CardContent className="p-10">
					{registrations.registrations.length === 0 ? (
						<div className="py-20 text-center space-y-4 opacity-30">
							<Users className="h-12 w-12 mx-auto" />
							<p className="text-sm font-bold uppercase tracking-widest">
								No pilgrims registered for this journey yet.
							</p>
						</div>
					) : (
						<div className="space-y-6">
							{registrations.registrations.map((reg: any) => (
								<div
									key={reg.id}
									className="p-6 rounded-[2rem] bg-background border border-primary/10 flex items-center justify-between group hover:border-primary/40 transition-all shadow-sm"
								>
									<div className="flex items-center gap-6">
										<div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center text-primary">
											<User className="h-7 w-7" />
										</div>
										<div className="space-y-1">
											<p className="font-bold text-lg text-foreground">
												{reg.profileSnapshot?.first_name} {reg.profileSnapshot?.last_name}
											</p>
											<div className="flex flex-wrap items-center gap-4 text-[11px] text-foreground/50 font-bold uppercase tracking-widest">
												<span>{reg.profileSnapshot?.email}</span>
												<span className="h-1.5 w-1.5 rounded-full bg-primary/30" />
												<span>{reg.profileSnapshot?.phone_number || "No Phone"}</span>
											</div>
										</div>
									</div>
									<div className="text-right space-y-3">
										<Badge className="bg-primary/10 text-primary border-primary/20 px-4 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">
											{reg.travellersCount} Participants
										</Badge>
										<p className="text-[10px] text-foreground/30 font-bold uppercase tracking-widest">
											{reg.createdAt
												? (() => {
														try {
															const dateObj =
																typeof reg.createdAt.toDate === "function"
																	? reg.createdAt.toDate()
																	: new Date(reg.createdAt);
															return format(dateObj, "dd MMM yyyy");
														} catch (e) {
															return "Invalid Date";
														}
													})()
												: "N/A"}
										</p>
									</div>
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
