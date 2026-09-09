import { zodResolver } from "@hookform/resolvers/zod";
import { AddTourActionSchema, type AddTourActionDate } from "@workspace/shared/schemas/tour.schema";
import { ToursService } from "@workspace/shared/services/tours.service";
import { Loader2, Plus, Trash2, ArrowLeft } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
		defaultValues: {
			tour_code: "",
			name: "",
			overview: "",
			destination: "",
			price: 0,
			max_participants: 20,
			status: "REGISTRATION_OPEN",
			itinerary: [{ day_number: 1, title: "", description: "" }],
		},
	});

	const { control, handleSubmit } = form;
	const { fields, append, remove } = useFieldArray({ control, name: "itinerary" });

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Tour added successfully");
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
		<div className="space-y-6 max-w-5xl mx-auto pb-20">
			<MetaDetails metaTitle="Add Tour | Admin" />
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/admin/tours"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
				</Button>
				<h1 className="text-3xl font-bold">Add New Tour</h1>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					<Card>
						<CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
						<CardContent className="grid md:grid-cols-2 gap-6">
							<FormField control={control} name="tour_code" render={({ field }) => (
								<FormItem><FormLabel>Tour Code</FormLabel><FormControl><Input placeholder="DXB-001" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="name" render={({ field }) => (
								<FormItem><FormLabel>Tour Title</FormLabel><FormControl><Input placeholder="Wonderful Kerala" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="destination" render={({ field }) => (
								<FormItem><FormLabel>Destination</FormLabel><FormControl><Input placeholder="Kerala, India" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="status" render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
										<SelectContent>
											<SelectItem value="DRAFT">Draft</SelectItem>
											<SelectItem value="PUBLISHED">Published</SelectItem>
											<SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
											<SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader><CardTitle>Pricing & Capacity</CardTitle></CardHeader>
						<CardContent className="grid md:grid-cols-2 gap-6">
							<FormField control={control} name="price" render={({ field }) => (
								<FormItem><FormLabel>Price (INR)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="max_participants" render={({ field }) => (
								<FormItem><FormLabel>Max Capacity</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Itinerary</CardTitle>
							<Button type="button" variant="outline" size="sm" onClick={() => append({ day_number: fields.length + 1, title: "", description: "" })}>
								<Plus className="h-4 w-4 mr-2" /> Add Day
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							{fields.map((field, index) => (
								<div key={field.id} className="border p-4 rounded-lg space-y-4">
									<div className="flex justify-between items-center">
										<h4 className="font-bold">Day {index + 1}</h4>
										<Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
									</div>
									<FormField control={control} name={`itinerary.${index}.title`} render={({ field }) => (
										<FormItem><FormLabel>Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
									)} />
									<FormField control={control} name={`itinerary.${index}.description`} render={({ field }) => (
										<FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl></FormItem>
									)} />
								</div>
							))}
						</CardContent>
					</Card>

					<div className="flex justify-end gap-4">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Create Tour"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
