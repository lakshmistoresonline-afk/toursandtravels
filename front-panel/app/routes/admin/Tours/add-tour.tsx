import { zodResolver } from "@hookform/resolvers/zod";
import { AddTourActionSchema, type AddTourActionDate } from "@workspace/shared/schemas/tour.schema";
import { ToursService } from "@workspace/shared/services/tours.service";
import { Loader2, Plus, Trash2, ArrowLeft, Image as ImageIcon, Info, MapPin, IndianRupee } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { Separator } from "~/components/ui/separator";

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

	const { control, handleSubmit } = form;
	const { fields, append, remove } = useFieldArray({ control, name: "itinerary" });

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
		<div className="space-y-10 max-w-5xl mx-auto pb-20 animate-in fade-in slide-in-from-bottom-4 duration-500">
			<MetaDetails metaTitle="Initiate Pilgrimage Journey | Admin" metaDescription="Create a new sacred journey experience." />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				<div className="space-y-1">
					<h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Initiate Pilgrimage Journey</h1>
					<p className="text-slate-500 text-lg italic">Draft or Publish a new sacred experience for your pilgrims.</p>
				</div>
				<Button variant="outline" size="lg" className="rounded-2xl px-6 border-2 font-bold" asChild>
					<Link to="/admin/tours"><ArrowLeft className="mr-2 h-4 w-4" /> Cancel & Back</Link>
				</Button>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					{/* Basic Info Section */}
					<Card className="border-none shadow-sm rounded-3xl overflow-hidden">
						<CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-primary/10 rounded-lg"><Info className="h-5 w-5 text-primary" /></div>
								<div>
									<CardTitle className="text-xl font-bold">General Information</CardTitle>
									<CardDescription>Basic pilgrimage journey identifiers and descriptions.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-8 grid md:grid-cols-2 gap-8">
							<FormField control={control} name="tour_code" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">Unique Pilgrimage Journey Code</FormLabel><FormControl><Input placeholder="e.g. KER-001" className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="name" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">Pilgrimage Journey Title</FormLabel><FormControl><Input placeholder="e.g. Magical Kerala Backwaters" className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="destination" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">Primary Destination</FormLabel><FormControl><Input placeholder="e.g. Munnar, Kerala" className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="status" render={({ field }) => (
								<FormItem>
									<FormLabel className="font-bold text-slate-700">Registration Status</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
										<SelectContent className="rounded-xl">
											<SelectItem value="DRAFT">Draft (Invisible to users)</SelectItem>
											<SelectItem value="PUBLISHED">Published (Visible only)</SelectItem>
											<SelectItem value="REGISTRATION_OPEN">Open for Registration (Active)</SelectItem>
											<SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)} />
							<FormField control={control} name="start_date" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">Start Date</FormLabel><FormControl><Input type="date" className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="start_time" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">Start Time</FormLabel><FormControl><Input type="time" className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="end_date" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">End Date</FormLabel><FormControl><Input type="date" className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="end_time" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">End Time</FormLabel><FormControl><Input type="time" className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<div className="md:col-span-2">
								<FormField control={control} name="overview" render={({ field }) => (
									<FormItem><FormLabel className="font-bold text-slate-700">Pilgrimage Journey Overview</FormLabel><FormControl><Textarea placeholder="Describe the amazing journey..." className="min-h-[150px] rounded-xl p-4" {...field} /></FormControl></FormItem>
								)} />
							</div>
						</CardContent>
					</Card>

					{/* Pricing & Capacity */}
					<Card className="border-none shadow-sm rounded-3xl overflow-hidden">
						<CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-emerald-500/10 rounded-lg"><IndianRupee className="h-5 w-5 text-emerald-600" /></div>
								<div>
									<CardTitle className="text-xl font-bold">Pricing & Logistics</CardTitle>
									<CardDescription>Set the financial and capacity boundaries.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-8 grid md:grid-cols-2 gap-8">
							<FormField control={control} name="price" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">Base Price (INR)</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="max_participants" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">Maximum Group Size</FormLabel><FormControl><Input type="number" className="h-12 rounded-xl" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					{/* Itinerary */}
					<Card className="border-none shadow-sm rounded-3xl overflow-hidden">
						<CardHeader className="bg-slate-50 p-8 border-b border-slate-100 flex flex-row items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-purple-500/10 rounded-lg"><MapPin className="h-5 w-5 text-purple-600" /></div>
								<div>
									<CardTitle className="text-xl font-bold">Journey Schedule</CardTitle>
									<CardDescription>Add the day-by-day breakdown.</CardDescription>
								</div>
							</div>
							<Button type="button" variant="outline" className="rounded-xl font-bold border-2" onClick={() => append({ day_number: fields.length + 1, title: "", description: "" })}>
								<Plus className="h-4 w-4 mr-2" /> Add Day
							</Button>
						</CardHeader>
						<CardContent className="p-8 space-y-6">
							{fields.map((field, index) => (
								<div key={field.id} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-4 relative group">
									<div className="flex justify-between items-center">
										<Badge className="bg-slate-900 px-4 py-1 rounded-full">Day {index + 1}</Badge>
										<Button type="button" variant="ghost" size="sm" className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full" onClick={() => remove(index)}><Trash2 className="h-4 w-4" /></Button>
									</div>
									<FormField control={control} name={`itinerary.${index}.title`} render={({ field }) => (
										<FormItem><FormLabel className="font-bold text-slate-600">Day Title</FormLabel><FormControl><Input placeholder="e.g. Arrival and Beach bonfire" className="bg-white rounded-xl border-none h-11" {...field} /></FormControl></FormItem>
									)} />
									<FormField control={control} name={`itinerary.${index}.description`} render={({ field }) => (
										<FormItem><FormLabel className="font-bold text-slate-600">Day Description</FormLabel><FormControl><Textarea placeholder="What will happen on this day?" className="bg-white rounded-xl border-none min-h-[100px] p-3" {...field} /></FormControl></FormItem>
									)} />
								</div>
							))}
						</CardContent>
					</Card>

					{/* Image Section Placeholder */}
					<Card className="border-none shadow-sm rounded-3xl overflow-hidden">
						<CardHeader className="bg-slate-50 p-8 border-b border-slate-100">
							<div className="flex items-center gap-3">
								<div className="p-2 bg-orange-500/10 rounded-lg"><ImageIcon className="h-5 w-5 text-orange-600" /></div>
								<div>
									<CardTitle className="text-xl font-bold">Visual Assets</CardTitle>
									<CardDescription>Provide a link to the cover image.</CardDescription>
								</div>
							</div>
						</CardHeader>
						<CardContent className="p-8">
							<FormField control={control} name="cover_image" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-700">Cover Image URL</FormLabel><FormControl><Input placeholder="https://images.unsplash.com/..." className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					<div className="flex justify-end pt-6">
						<Button type="submit" size="lg" className="rounded-2xl px-12 py-7 text-xl font-black shadow-2xl shadow-primary/30 hover:scale-105 transition-transform" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-2 h-6 w-6" /> : "Initiate Pilgrimage Journey Now"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
