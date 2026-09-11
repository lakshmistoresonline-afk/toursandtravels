import { zodResolver } from "@hookform/resolvers/zod";
import { AddTourActionSchema, type AddTourActionDate } from "@workspace/shared/schemas/tour.schema";
import { ToursService } from "@workspace/shared/services/tours.service";
import { Loader2, Plus, Trash2, ArrowLeft, Image as ImageIcon, Info, MapPin, IndianRupee } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
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

	const tourName = useWatch({
		control,
		name: "name",
	});

	const startDate = useWatch({
		control,
		name: "start_date",
	});

	// Auto-populate tour_code
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
			toast.success("Tour initiated successfully!");
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
			<MetaDetails metaTitle="Initiate Pilgrimage Journey | Admin" metaDescription="Create a new sacred journey experience." />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-serif text-[#fdfcf0] tracking-tight">Initiate Journey</h1>
					<p className="text-[#fdfcf0]/40 text-sm uppercase tracking-[0.2em] font-bold">Draft or Publish a new sacred experience.</p>
				</div>
				<Button variant="ghost" size="sm" className="rounded-full px-6 text-[#d4af37] hover:bg-[#d4af37]/10 font-bold uppercase tracking-widest text-[9px]" asChild>
					<Link to="/admin/tours"><ArrowLeft className="mr-2 h-3 w-3" /> Cancel & Back</Link>
				</Button>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					{/* Basic Info Section */}
					<div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
						<div className="bg-[#d4af37]/5 p-8 border-b border-white/5 flex items-center gap-4">
							<Info className="h-5 w-5 text-[#d4af37]" />
							<div>
								<h3 className="text-xl font-serif text-[#fdfcf0]">General Information</h3>
								<p className="text-[#fdfcf0]/40 text-[10px] uppercase tracking-widest">Journey identifiers and descriptions.</p>
							</div>
						</div>
						<div className="p-8 grid md:grid-cols-2 gap-8">
							<FormField control={control} name="name" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Journey Title</FormLabel>
									<FormControl><Input placeholder="e.g. Munnar Sacred Retreat" className="h-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="tour_code" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Journey Code</FormLabel>
									<FormControl><Input placeholder="Auto-generated" className="h-12 rounded-xl bg-[#0a0e1a] border-white/5 text-[#d4af37] font-mono font-bold opacity-60 pointer-events-none" {...field} readOnly tabIndex={-1} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="destination" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Primary Destination</FormLabel>
									<FormControl><Input placeholder="e.g. Munnar, Kerala" className="h-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="status" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Registration Status</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl><SelectTrigger className="h-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20"><SelectValue /></SelectTrigger></FormControl>
										<SelectContent className="bg-[#0a0e1a] border border-white/10 text-[#fdfcf0]">
											<SelectItem value="DRAFT">Draft (Hidden)</SelectItem>
											<SelectItem value="PUBLISHED">Published (View Only)</SelectItem>
											<SelectItem value="REGISTRATION_OPEN">Registration Open (Active)</SelectItem>
											<SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="start_date" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Start Date</FormLabel>
									<FormControl><Input type="date" className="h-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="start_time" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Start Time</FormLabel>
									<FormControl><Input type="time" className="h-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="end_date" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">End Date</FormLabel>
									<FormControl><Input type="date" className="h-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="end_time" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">End Time</FormLabel>
									<FormControl><Input type="time" className="h-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<div className="md:col-span-2">
								<FormField control={control} name="overview" render={({ field }) => (
									<FormItem>
										<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Journey Overview</FormLabel>
										<FormControl><Textarea placeholder="Describe the spiritual experience..." className="min-h-[160px] rounded-2xl bg-white/5 border-white/10 p-6 text-[#fdfcf0]/70 text-sm leading-relaxed outline-none focus:ring-1 focus:ring-[#d4af37]/20 resize-none" {...field} /></FormControl>
										<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
									</FormItem>
								)} />
							</div>
						</div>
					</div>

					{/* Pricing & Capacity */}
					<div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
						<div className="bg-[#d4af37]/5 p-8 border-b border-white/5 flex items-center gap-4">
							<IndianRupee className="h-5 w-5 text-[#d4af37]" />
							<div>
								<h3 className="text-xl font-serif text-[#fdfcf0]">Pricing & Capacity</h3>
								<p className="text-[#fdfcf0]/40 text-[10px] uppercase tracking-widest">Define exchange and pilgrims limit.</p>
							</div>
						</div>
						<div className="p-8 grid md:grid-cols-2 gap-8">
							<FormField control={control} name="price" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Base Price (INR)</FormLabel>
									<FormControl><Input type="number" className="h-14 rounded-xl bg-white/5 border-white/10 text-[#d4af37] font-serif text-2xl px-6" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
							<FormField control={control} name="max_participants" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Pilgrims Limit</FormLabel>
									<FormControl><Input type="number" className="h-14 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] font-serif text-2xl px-6" {...field} onFocus={(e) => e.target.select()} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
						</div>
					</div>

					{/* Itinerary */}
					<div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
						<div className="bg-[#d4af37]/5 p-8 border-b border-white/5 flex items-center justify-between">
							<div className="flex items-center gap-4">
								<MapPin className="h-5 w-5 text-[#d4af37]" />
								<div>
									<h3 className="text-xl font-serif text-[#fdfcf0]">Journey Roadmap</h3>
									<p className="text-[#fdfcf0]/40 text-[10px] uppercase tracking-widest">Day-by-day spiritual schedule.</p>
								</div>
							</div>
							<Button type="button" variant="ghost" className="rounded-full h-12 px-6 text-[#d4af37] hover:bg-[#d4af37]/10 font-bold uppercase tracking-widest text-[9px]" onClick={() => append({ day_number: fields.length + 1, title: "", description: "" })}>
								<Plus className="h-4 w-4 mr-2" /> Add Day
							</Button>
						</div>
						<div className="p-8 space-y-6">
							{fields.map((field, index) => (
								<div key={field.id} className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 space-y-6 relative group">
									<div className="flex justify-between items-center">
										<Badge className="bg-[#d4af37]/10 text-[#d4af37] border-none px-4 py-1 rounded-full font-serif text-sm">Day {index + 1}</Badge>
										<Button type="button" variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-400/10 rounded-full h-10 w-10 p-0" onClick={() => remove(index)}><Trash2 className="h-5 w-5" /></Button>
									</div>
									<FormField control={control} name={`itinerary.${index}.title`} render={({ field }) => (
										<FormItem>
											<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Theme / Title</FormLabel>
											<FormControl><Input placeholder="e.g. Spiritual Initiation" className="bg-white/5 rounded-xl border-white/10 h-12 text-[#fdfcf0] font-bold text-base px-6" {...field} /></FormControl>
											<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
										</FormItem>
									)} />
									<FormField control={control} name={`itinerary.${index}.description`} render={({ field }) => (
										<FormItem>
											<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Description</FormLabel>
											<FormControl><Textarea placeholder="Experience details..." className="bg-white/5 rounded-2xl border-white/10 min-h-[100px] p-5 text-[#fdfcf0]/70 text-xs leading-relaxed resize-none" {...field} /></FormControl>
											<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
										</FormItem>
									)} />
								</div>
							))}
						</div>
					</div>

					{/* Visual Assets */}
					<div className="bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden shadow-2xl">
						<div className="bg-[#d4af37]/5 p-8 border-b border-white/5 flex items-center gap-4">
							<ImageIcon className="h-5 w-5 text-[#d4af37]" />
							<div>
								<h3 className="text-xl font-serif text-[#fdfcf0]">Visual Artwork</h3>
								<p className="text-[#fdfcf0]/40 text-[10px] uppercase tracking-widest">The face of your journey.</p>
							</div>
						</div>
						<div className="p-8">
							<FormField control={control} name="cover_image" render={({ field }) => (
								<FormItem>
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Cover Image URL</FormLabel>
									<FormControl><Input placeholder="https://images.unsplash.com/..." className="h-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] text-sm" {...field} /></FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)} />
						</div>
					</div>

					<div className="flex justify-end pt-8">
						<Button type="submit" className="rounded-full px-12 h-16 text-xs font-bold uppercase tracking-[0.2em] bg-[#d4af37] text-[#0a0e1a] shadow-xl shadow-[#d4af37]/10 hover:bg-[#b8860b] transition-all" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : null}
							Initiate Journey Now
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
