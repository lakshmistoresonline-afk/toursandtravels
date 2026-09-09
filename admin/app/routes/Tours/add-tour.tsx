import { zodResolver } from "@hookform/resolvers/zod";
import { AddTourActionSchema, type AddTourActionDate } from "@workspace/shared/schemas/tour.schema";
import { ToursService } from "@workspace/shared/services/tours.service";
import { ApiError } from "@workspace/shared/utils/ApiError";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import {
	type ActionFunctionArgs,
	Link,
	type LoaderFunctionArgs,
	useActionData,
	useLoaderData,
	useNavigate,
	useNavigation,
	useSubmit,
} from "react-router";
import { toast } from "sonner";
import BackButton from "~/components/Nav/BackButton";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { categoryListQuery } from "~/queries/categories.q";
import { citiesListQuery } from "~/queries/cities.q";

export const action = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const payloadRaw = formData.get("payload") as string;
		const payload = JSON.parse(payloadRaw);

		const cover_image = formData.get("cover_image") as File;

		const tours_svc = new ToursService(request);
		const tour_id = await tours_svc.addTour({
			...payload,
			cover_image: cover_image?.size > 0 ? cover_image : undefined,
		});

		return { success: true, tour_id };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const cities = await citiesListQuery({ request });
	const categories = await categoryListQuery({ request });
	return { cities, categories };
};

export default function AddTourPage() {
	const { cities, categories } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const submit = useSubmit();
	const navigation = useNavigation();
	const actionData = useActionData() as any;

	const form = useForm<AddTourActionDate>({
		resolver: zodResolver(AddTourActionSchema),
		defaultValues: {
			tour_code: "",
			name: "",
			overview: "",
			destination: "",
			departure_location: "",
			return_location: "",
			status: "DRAFT",
			price: 0,
			max_participants: 0,
			city_id: "",
			tour_category_id: "",
			isActive: "true",
			isFeatured: "false",
			itinerary: [{ day_number: 1, title: "Arrival", description: "" }],
			meta_details: {
				meta_title: "",
				meta_description: "",
				url_key: "",
				meta_keywords: "",
			}
		},
	});

	const { control, handleSubmit } = form;
	const { fields, append, remove } = useFieldArray({
		control,
		name: "itinerary",
	});

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Tour added successfully");
			navigate("/tours");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData, navigate]);

	const onSubmit = (values: AddTourActionDate) => {
		const formData = new FormData();
		const { cover_image, ...rest } = values;
		formData.append("payload", JSON.stringify(rest));
		if (cover_image instanceof File) {
			formData.append("cover_image", cover_image);
		}
		submit(formData, { method: "post", encType: "multipart/form-data" });
	};

	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="space-y-6 max-w-5xl mx-auto pb-20">
			<MetaDetails metaTitle="Add Tour | Admin" />
			<div className="flex items-center gap-4">
				<BackButton href="/tours" />
				<h1 className="text-3xl font-bold">Add New Tour</h1>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
					{/* Basic Information */}
					<Card>
						<CardHeader><CardTitle>Basic Information</CardTitle></CardHeader>
						<CardContent className="grid md:grid-cols-2 gap-6">
							<FormField control={control} name="tour_code" render={({ field }) => (
								<FormItem>
									<FormLabel>Tour Code</FormLabel>
									<FormControl><Input placeholder="e.g. DXB-001" {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={control} name="name" render={({ field }) => (
								<FormItem>
									<FormLabel>Tour Title</FormLabel>
									<FormControl><Input placeholder="Tour name" {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={control} name="city_id" render={({ field }) => (
								<FormItem>
									<FormLabel>City</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
										</FormControl>
										<SelectContent>
											{cities.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={control} name="tour_category_id" render={({ field }) => (
								<FormItem>
									<FormLabel>Category</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
										</FormControl>
										<SelectContent>
											{categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)} />
						</CardContent>
					</Card>

					{/* Pricing & Status */}
					<Card>
						<CardHeader><CardTitle>Pricing & Status</CardTitle></CardHeader>
						<CardContent className="grid md:grid-cols-3 gap-6">
							<FormField control={control} name="price" render={({ field }) => (
								<FormItem>
									<FormLabel>Price (AED)</FormLabel>
									<FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={control} name="max_participants" render={({ field }) => (
								<FormItem>
									<FormLabel>Max Participants</FormLabel>
									<FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={control} name="status" render={({ field }) => (
								<FormItem>
									<FormLabel>Status</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl>
											<SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
										</FormControl>
										<SelectContent>
											<SelectItem value="DRAFT">Draft</SelectItem>
											<SelectItem value="PUBLISHED">Published</SelectItem>
											<SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
											<SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
										</SelectContent>
									</Select>
									<FormMessage />
								</FormItem>
							)} />
						</CardContent>
					</Card>

					{/* Itinerary */}
					<Card>
						<CardHeader className="flex flex-row items-center justify-between">
							<CardTitle>Tour Itinerary</CardTitle>
							<Button type="button" variant="outline" size="sm" onClick={() => append({ day_number: fields.length + 1, title: "", description: "" })}>
								<Plus className="h-4 w-4 mr-2" /> Add Day
							</Button>
						</CardHeader>
						<CardContent className="space-y-4">
							{fields.map((field, index) => (
								<div key={field.id} className="border p-4 rounded-lg space-y-4 relative">
									<div className="flex justify-between items-center">
										<h4 className="font-bold">Day {index + 1}</h4>
										{fields.length > 1 && (
											<Button type="button" variant="ghost" size="sm" onClick={() => remove(index)}>
												<Trash2 className="h-4 w-4 text-destructive" />
											</Button>
										)}
									</div>
									<div className="grid md:grid-cols-2 gap-4">
										<FormField control={control} name={`itinerary.${index}.title`} render={({ field }) => (
											<FormItem>
												<FormLabel>Title</FormLabel>
												<FormControl><Input {...field} /></FormControl>
												<FormMessage />
											</FormItem>
										)} />
										<FormField control={control} name={`itinerary.${index}.departure_time`} render={({ field }) => (
											<FormItem>
												<FormLabel>Departure Time</FormLabel>
												<FormControl><Input type="time" {...field} /></FormControl>
												<FormMessage />
											</FormItem>
										)} />
									</div>
									<FormField control={control} name={`itinerary.${index}.description`} render={({ field }) => (
										<FormItem>
											<FormLabel>Description</FormLabel>
											<FormControl><Textarea {...field} /></FormControl>
											<FormMessage />
										</FormItem>
									)} />
								</div>
							))}
						</CardContent>
					</Card>

					{/* Media */}
					<Card>
						<CardHeader><CardTitle>Media</CardTitle></CardHeader>
						<CardContent>
							<FormField control={control} name="cover_image" render={({ field: { onChange, value, ...rest } }) => (
								<FormItem>
									<FormLabel>Cover Image</FormLabel>
									<FormControl>
										<Input type="file" accept="image/*" onChange={(e) => onChange(e.target.files?.[0])} {...rest} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />
						</CardContent>
					</Card>

					{/* SEO */}
					<Card>
						<CardHeader><CardTitle>SEO & Meta</CardTitle></CardHeader>
						<CardContent className="space-y-4">
							<FormField control={control} name="meta_details.url_key" render={({ field }) => (
								<FormItem>
									<FormLabel>URL Key (no spaces)</FormLabel>
									<FormControl><Input {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={control} name="meta_details.meta_title" render={({ field }) => (
								<FormItem>
									<FormLabel>Meta Title</FormLabel>
									<FormControl><Input {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={control} name="meta_details.meta_description" render={({ field }) => (
								<FormItem>
									<FormLabel>Meta Description</FormLabel>
									<FormControl><Textarea {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
						</CardContent>
					</Card>

					<div className="flex justify-end gap-4">
						<Button type="button" variant="outline" onClick={() => navigate("/tours")}>Cancel</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Save Tour"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

export type AddFormControlType = Control<AddTourInput>;
