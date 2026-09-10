import { ToursService } from "@workspace/shared/services/tours.service";
import { Loader2, ArrowLeft, Plus, Trash2 } from "lucide-react";
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
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
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
		<div className="space-y-6 max-w-5xl mx-auto pb-20">
			<MetaDetails metaTitle="Update Tour | Admin" />
			<div className="flex items-center gap-4">
				<Button variant="ghost" size="sm" asChild>
					<Link to="/admin/tours"><ArrowLeft className="mr-2 h-4 w-4" /> Back</Link>
				</Button>
				<h1 className="text-3xl font-bold">Update Tour</h1>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					<Card>
						<CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
						<CardContent className="grid md:grid-cols-2 gap-6">
							<FormField control={control} name="tour_code" render={({ field }) => (
								<FormItem><FormLabel>Tour Code</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="name" render={({ field }) => (
								<FormItem><FormLabel>Tour Title</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="destination" render={({ field }) => (
								<FormItem><FormLabel>Destination</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
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
							<FormField control={control} name="start_date" render={({ field }) => (
								<FormItem><FormLabel>Start Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="start_time" render={({ field }) => (
								<FormItem><FormLabel>Start Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="end_date" render={({ field }) => (
								<FormItem><FormLabel>End Date</FormLabel><FormControl><Input type="date" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="end_time" render={({ field }) => (
								<FormItem><FormLabel>End Time</FormLabel><FormControl><Input type="time" {...field} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					<div className="flex justify-end gap-4">
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Save Changes"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
