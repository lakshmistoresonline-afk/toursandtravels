import { zodResolver } from "@hookform/resolvers/zod";
import { AddTourActionSchema } from "@workspace/shared/schemas/tour.schema";
import { ToursService } from "@workspace/shared/services/tours.service";
import {
	Loader2,
	Plus,
	Trash2,
	ArrowLeft,
	Image as ImageIcon,
	Info,
	MapPin,
	IndianRupee,
	FileText,
} from "lucide-react";
import { useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import {
	type ActionFunctionArgs,
	Link,
	useActionData,
	useNavigate,
	useNavigation,
	useSubmit,
} from "react-router";
import { toast } from "sonner";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

export const clientAction = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const payloadRaw = formData.get("payload") as string;
		const payload = JSON.parse(payloadRaw);

		const svc = new ToursService();
		const tourId = await svc.addTour(payload);

		return { success: true, tourId };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

export default function AddTourPage() {
	const navigate = useNavigate();
	const submit = useSubmit();
	const navigation = useNavigation();
	const actionData = useActionData() as any;

	const form = useForm<any>({
		resolver: zodResolver(AddTourActionSchema),
		defaultValues: {
			tour_code: "",
			name: "",
			overview: "",
			destination: "",
			price: 0,
			max_participants: 20,
			status: "REGISTRATION_OPEN",
			start_date: "",
			start_time: "",
			end_date: "",
			end_time: "",
			itinerary: [{ day_number: 1, title: "Day 1: Arrival & Welcome", description: "" }],
		},
	});

	const { control, handleSubmit, setValue } = form;
	const { fields, append, remove } = useFieldArray({ control, name: "itinerary" });

	const tourName = useWatch({ control, name: "name" });
	const startDate = useWatch({ control, name: "start_date" });

	useEffect(() => {
		if (tourName) {
			const slug = tourName
				.toLowerCase()
				.replace(/[^a-z0-9]+/g, "-")
				.replace(/(^-|-$)+/g, "");
			const dateSuffix = startDate ? startDate.replace(/-/g, "") : "";
			const generatedCode = `${slug}${dateSuffix ? "-" + dateSuffix : ""}`;
			setValue("tour_code", generatedCode, { shouldValidate: true });
		}
	}, [tourName, startDate, setValue]);

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Journey initiated successfully!");
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
				metaTitle="Initiate Journey | AMBADY Admin"
				metaDescription="Create a new sacred pilgrimage experience."
			/>

			<div className="flex items-center justify-between border-b border-primary/10 pb-8">
				<div className="flex items-center gap-4">
					<Button
						asChild
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-primary/5 text-primary"
					>
						<Link to="/admin/tours">
							<ArrowLeft className="h-5 w-5" />
						</Link>
					</Button>
					<div>
						<h1 className="text-4xl font-serif text-foreground tracking-tight leading-tight">
							Initiate Journey
						</h1>
						<p className="text-foreground/40 mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
							Draft or Publish a new sacred experience.
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
													placeholder="e.g. Kedarnath Yatra 2026"
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
													placeholder="e.g. Kedarnath, Uttarakhand"
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
													<SelectItem value="DRAFT">Draft (Hidden)</SelectItem>
													<SelectItem value="PUBLISHED">
														Published (View Only)
													</SelectItem>
													<SelectItem value="REGISTRATION_OPEN">
														Registration Open (Active)
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

					{/* Narrative */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<FileText className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Sacred Narrative
							</h3>
						</div>
						<CardContent className="p-10">
							<FormField
								control={control}
								name="overview"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Journey Overview
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe the spiritual experience..."
												className="min-h-[200px] p-8 rounded-[2.5rem] border-primary/20 bg-white text-foreground text-base resize-none focus:ring-primary/20 leading-relaxed shadow-sm"
												{...field}
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
								Visual Identity
							</h3>
						</div>
						<CardContent className="p-10">
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
												placeholder="https://images.unsplash.com/..."
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
							{isSubmitting ? (
								<Loader2 className="animate-spin mr-4 h-6 w-6" />
							) : (
								<Plus className="mr-4 h-6 w-6" />
							)}
							Initiate Journey Now
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
