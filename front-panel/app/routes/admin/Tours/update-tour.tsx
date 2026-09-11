import { zodResolver } from "@hookform/resolvers/zod";
import { AddTourActionSchema } from "@workspace/shared/schemas/tour.schema";
import { ToursService } from "@workspace/shared/services/tours.service";
import { Loader2, ArrowLeft, Plus, Trash2, Info, MapPin, IndianRupee, Image as ImageIcon } from "lucide-react";
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
	Link,
} from "react-router";
import { toast } from "sonner";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";

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
	const tour = await svc.getTourDetails(params.id!);
	return { tour };
};

export default function UpdateTourPage() {
	const { tour } = useLoaderData<typeof clientLoader>();
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
		},
	});

	const { control, handleSubmit } = form;
	const { fields, append, remove } = useFieldArray({ control, name: "itinerary" });

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Tour updated successfully");
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
		<div className="space-y-10 max-w-5xl mx-auto pb-20 animate-in fade-in duration-700">
			<MetaDetails metaTitle="Update Tour | Admin" metaDescription="Update your sacred journey experience." />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-serif text-[#fdfcf0] tracking-tight">Update Journey</h1>
					<p className="text-[#fdfcf0]/40 text-sm uppercase tracking-[0.2em] font-bold">Modify the details of your initiated experience.</p>
				</div>
				<Button variant="ghost" size="sm" className="rounded-full px-6 text-[#d4af37] hover:bg-[#d4af37]/10 font-bold uppercase tracking-widest text-[9px]" asChild>
					<Link to="/admin/tours"><ArrowLeft className="mr-2 h-3 w-3" /> Back to Inventory</Link>
				</Button>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					{/* Basic Info Section */}
					<div className="surface-card-strong rounded-[2rem] overflow-hidden shadow-2xl">
						<div className="bg-[#d4af37]/10 p-8 border-b border-white/5 flex items-center gap-4">
							<Info className="h-5 w-5 text-[#d4af37]" />
							<div>
								<h3 className="text-xl font-serif text-[#fdfcf0]">General Information</h3>
								<p className="text-[#fdfcf0]/60 text-[10px] uppercase tracking-widest">Core journey identifiers.</p>
							</div>
						</div>
						<div className="p-8 grid md:grid-cols-2 gap-8 bg-black/20">
							<FormField control={control} name="name" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Journey Title</FormLabel>
									<FormControl><Input placeholder="e.g. Munnar Sacred Retreat" className="h-12 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="tour_code" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Journey Code</FormLabel>
									<FormControl><Input placeholder="Auto-generated" className="h-12 rounded-xl bg-[#0a0e1a] border-white/5 text-[#d4af37] font-mono font-bold opacity-60 pointer-events-none" {...field} readOnly tabIndex={-1} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="destination" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Primary Destination</FormLabel>
									<FormControl><Input placeholder="e.g. Munnar, Kerala" className="h-12 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="status" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Registration Status</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl><SelectTrigger className="h-12 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20"><SelectValue /></SelectTrigger></FormControl>
										<SelectContent className="surface-card-solid border border-white/10 text-[#fdfcf0]">
											<SelectItem value="DRAFT">Draft</SelectItem>
											<SelectItem value="PUBLISHED">Published</SelectItem>
											<SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
											<SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="start_date" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Start Date</FormLabel>
									<FormControl><Input type="date" className="h-12 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="start_time" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Start Time</FormLabel>
									<FormControl><Input type="time" className="h-12 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="end_date" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">End Date</FormLabel>
									<FormControl><Input type="date" className="h-12 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="end_time" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">End Time</FormLabel>
									<FormControl><Input type="time" className="h-12 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<div className="md:col-span-2">
								<FormField control={control} name="overview" render={({ field }) => (
									<FormItem>
										<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Journey Overview</FormLabel>
										<FormControl><Textarea placeholder="Describe the journey..." className="min-h-[160px] rounded-2xl bg-black/40 border-white/10 p-6 text-[#fdfcf0]/70 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-[#d4af37]/20 resize-none" {...field} /></FormControl>
										<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
									</FormItem>
								)} />
							</div>
						</div>
					</div>

					{/* Pricing Card */}
					<div className="surface-card-strong rounded-[2rem] overflow-hidden shadow-2xl">
						<div className="bg-[#d4af37]/10 p-8 border-b border-white/5 flex items-center gap-4">
							<IndianRupee className="h-5 w-5 text-[#d4af37]" />
							<div>
								<h3 className="text-xl font-serif text-[#fdfcf0]">Pricing & Capacity</h3>
								<p className="text-[#fdfcf0]/60 text-[10px] uppercase tracking-widest">Financial and capacity settings.</p>
							</div>
						</div>
						<div className="p-8 grid md:grid-cols-2 gap-8 bg-black/20">
							<FormField control={control} name="price" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Base Price (INR)</FormLabel>
									<FormControl><Input type="number" className="h-14 rounded-xl bg-black/40 border-white/10 text-[#d4af37] font-serif text-2xl px-6 focus-visible:ring-[#d4af37]/20" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="max_participants" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Pilgrims Limit</FormLabel>
									<FormControl><Input type="number" className="h-14 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] font-serif text-2xl px-6 focus-visible:ring-[#d4af37]/20" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
						</div>
					</div>

					{/* Itinerary Section */}
					<div className="surface-card-strong rounded-[2rem] overflow-hidden shadow-2xl">
						<div className="bg-[#d4af37]/10 p-8 border-b border-white/5 flex items-center justify-between">
							<div className="flex items-center gap-4">
								<MapPin className="h-5 w-5 text-[#d4af37]" />
								<div>
									<h3 className="text-xl font-serif text-[#fdfcf0]">Journey Roadmap</h3>
									<p className="text-[#fdfcf0]/60 text-[10px] uppercase tracking-widest">The spiritual roadmap.</p>
								</div>
							</div>
							<Button type="button" variant="ghost" className="rounded-full h-12 px-6 text-[#d4af37] hover:bg-[#d4af37]/10 font-bold uppercase tracking-widest text-[9px]" onClick={() => append({ day_number: fields.length + 1, title: "", description: "" })}>
								<Plus className="h-4 w-4 mr-2" /> Add Day
							</Button>
						</div>
						<div className="p-8 space-y-6 bg-black/20">
							{fields.map((field, index) => (
								<div key={field.id} className="p-8 rounded-3xl bg-black/40 border border-white/10 space-y-6 relative group shadow-xl">
									<div className="flex justify-between items-center">
										<Badge className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/30 px-4 py-1 rounded-full font-serif text-sm">Day {index + 1}</Badge>
										<Button type="button" variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-400/10 rounded-full h-10 w-10 p-0" onClick={() => remove(index)}><Trash2 className="h-5 w-5" /></Button>
									</div>
									<FormField control={control} name={`itinerary.${index}.title`} render={({ field }) => (
										<FormItem>
											<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Theme / Title</FormLabel>
											<FormControl><Input placeholder="e.g. Spiritual Initiation" className="bg-black/40 rounded-xl border-white/10 h-12 text-[#fdfcf0] font-bold text-base px-6 focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
											<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
										</FormItem>
									)} />
									<FormField control={control} name={`itinerary.${index}.description`} render={({ field }) => (
										<FormItem>
											<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Description</FormLabel>
											<FormControl><Textarea placeholder="Experience details..." className="bg-black/40 rounded-2xl border-white/10 min-h-[100px] p-5 text-[#fdfcf0]/70 text-xs leading-relaxed resize-none focus:ring-[#d4af37]/20" {...field} /></FormControl>
											<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
										</FormItem>
									)} />
								</div>
							))}
						</div>
					</div>

					{/* Visual Assets */}
					<div className="surface-card-strong rounded-[2rem] overflow-hidden shadow-2xl">
						<div className="bg-[#d4af37]/10 p-8 border-b border-white/5 flex items-center gap-4">
							<ImageIcon className="h-5 w-5 text-[#d4af37]" />
							<div>
								<h3 className="text-xl font-serif text-[#fdfcf0]">Visual Artwork</h3>
								<p className="text-[#fdfcf0]/60 text-[10px] uppercase tracking-widest">The face of your journey.</p>
							</div>
						</div>
						<div className="p-8 bg-black/20">
							<FormField control={control} name="cover_image" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Cover Image URL</FormLabel>
									<FormControl><Input placeholder="https://..." className="h-12 rounded-xl bg-black/40 border-white/10 text-[#fdfcf0] text-sm focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
						</div>
					</div>

					<div className="flex justify-end pt-8">
						<Button type="submit" className="rounded-full px-12 h-16 text-xs font-bold uppercase tracking-[0.2em] bg-[#d4af37] text-[#0a0e1a] shadow-xl shadow-[#d4af37]/10 hover:bg-[#b8860b] transition-all" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : null}
							Update Journey
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
