import { zodResolver } from "@hookform/resolvers/zod";
import { AddTourActionSchema, type AddTourActionDate } from "@workspace/shared/schemas/tour.schema";
import { ToursService } from "@workspace/shared/services/tours.service";
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
import { tourDetailsQuery } from "~/queries/tours.q";

export const action = async ({ request, params }: ActionFunctionArgs) => {
	try {
		const tour_id = params.id;
		const formData = await request.formData();
		const payloadRaw = formData.get("payload") as string;
		const payload = JSON.parse(payloadRaw);
		const cover_image = formData.get("cover_image") as File;

		const tours_svc = new ToursService(request);
		await tours_svc.updateTour({
			tour_update: {
				tour_code: payload.tour_code,
				name: payload.name,
				overview: payload.overview,
				price: payload.price,
				status: payload.status,
				max_participants: payload.max_participants,
				city_id: Number(payload.city_id),
				tour_category_id: Number(payload.tour_category_id),
				start_date: payload.start_date,
				end_date: payload.end_date,
			},
			itinerary: payload.itinerary,
			cover_image: cover_image?.size > 0 ? cover_image : undefined,
			meta_details: payload.meta_details,
		}, tour_id!);

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
	const tour = await tourDetailsQuery({ request, tour_id: params.id! });
	const cities = await citiesListQuery({ request });
	const categories = await categoryListQuery({ request });
	return { tour, cities, categories };
};

export default function UpdateTourPage() {
	const { tour, cities, categories } = useLoaderData<typeof loader>();
	const navigate = useNavigate();
	const submit = useSubmit();
	const navigation = useNavigation();
	const actionData = useActionData() as any;

	const form = useForm<AddTourActionDate>({
		resolver: zodResolver(AddTourActionSchema),
		defaultValues: {
			tour_code: tour.tour_code || "",
			name: tour.name,
			overview: tour.overview,
			status: tour.status,
			price: tour.price,
			max_participants: tour.max_participants,
			city_id: tour.city_id.toString(),
			tour_category_id: tour.tour_category_id.toString(),
			start_date: tour.start_date || "",
			end_date: tour.end_date || "",
			itinerary: tour.itinerary.length > 0 ? tour.itinerary : [{ day_number: 1, title: "", description: "" }],
			meta_details: {
				url_key: tour.meta_details?.url_key || "",
				meta_title: tour.meta_details?.meta_title || "",
				meta_description: tour.meta_details?.meta_description || "",
			}
		},
	});

	const { control, handleSubmit } = form;
	const { fields, append, remove } = useFieldArray({ control, name: "itinerary" });

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Tour updated successfully");
			navigate("/tours");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData, navigate]);

	const onSubmit = (values: AddTourActionDate) => {
		const formData = new FormData();
		const { cover_image, ...rest } = values;
		formData.append("payload", JSON.stringify(rest));
		if (cover_image instanceof File) formData.append("cover_image", cover_image);
		submit(formData, { method: "post", encType: "multipart/form-data" });
	};

	const isSubmitting = navigation.state === "submitting";

	return (
		<div className="space-y-6 max-w-5xl mx-auto pb-20">
			<MetaDetails metaTitle={`Update ${tour.name} | Admin`} />
			<div className="flex items-center gap-4">
				<BackButton href="/tours" />
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
							<FormField control={control} name="city_id" render={({ field }) => (
								<FormItem><FormLabel>City</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl><SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger></FormControl>
										<SelectContent>{cities.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
									</Select>
								</FormItem>
							)} />
							<FormField control={control} name="tour_category_id" render={({ field }) => (
								<FormItem><FormLabel>Category</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl><SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger></FormControl>
										<SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent>
									</Select>
								</FormItem>
							)} />
						</CardContent>
					</Card>

					{/* Pricing & Status */}
					<Card>
						<CardHeader><CardTitle>Pricing & Status</CardTitle></CardHeader>
						<CardContent className="grid md:grid-cols-3 gap-6">
							<FormField control={control} name="price" render={({ field }) => (
								<FormItem><FormLabel>Price (AED)</FormLabel><FormControl><Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} /></FormControl></FormItem>
							)} />
							<FormField control={control} name="status" render={({ field }) => (
								<FormItem><FormLabel>Status</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value}>
										<FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
										<SelectContent>
											<SelectItem value="DRAFT">Draft</SelectItem>
											<SelectItem value="PUBLISHED">Published</SelectItem>
											<SelectItem value="REGISTRATION_OPEN">Registration Open</SelectItem>
											<SelectItem value="REGISTRATION_CLOSED">Registration Closed</SelectItem>
											<SelectItem value="UPCOMING">Upcoming</SelectItem>
											<SelectItem value="COMPLETED">Completed</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)} />
						</CardContent>
					</Card>
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
						<Button type="button" variant="outline" onClick={() => navigate("/tours")}>Cancel</Button>
						<Button type="submit" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Update Tour"}
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}

	return (
		<>
			<MetaDetails
				metaTitle={"Update " + tour?.name + " Tour | Admin Panel"}
				metaDescription={"Update" + tour?.name + " Tour"}
				metaKeywords="Update Tour"
			/>
			<section className="flex flex-col gap-4">
				<div className="flex gap-4 items-center">
					<BackButton href="/tours" />
					<h1 className="text-2xl font-semibold">Update Tour</h1>
				</div>
				<form className="space-y-4" onSubmit={handleSubmit(onFormSubmit)}>
					<Form {...form}>
						<div className="grid md:grid-cols-2 gap-4">
							{/* General Card */}
							<GeneralDetailsCard
								control={control as any}
								cities={cities}
								categories={categories}
								providers={providers}
							/>

							{/* Attributes Card */}
							<AttributesCard control={control as any} />
						</div>

						{/* Images Card */}
						<ImagesInputCard control={control as any} />

						{/* Tags Selection Card */}
						<TagsCard control={control as any} tags={tags} noTags={watchedTags.length === 0} />

						{/* MAIN Content Card */}
						<MainContentCard
							control={control as any}
							cancellation_policies={cancellation_policies}
						/>

						{/* Options Card */}
						<TourOptionsCard control={control as any} participants={participants} />

						{/* Address Card */}
						<AddressCard control={control as any} />

						{/* Meta Details Card */}
						<Card>
							<CardHeader>
								<CardTitle className="text-lg">SEO & Meta Attributes</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								{/* Meta Title */}
								<FormField
									control={control}
									name="meta_details.meta_title"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Meta Title</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g. Ferrari World, Abu Dhabi"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Meta Description */}
								<FormField
									control={control}
									name="meta_details.meta_description"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Meta Description</FormLabel>
											<FormControl>
												<Textarea
													placeholder="A short description for SEO"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* Meta Keywords */}
								<FormField
									control={control}
									name="meta_details.meta_keywords"
									render={({ field, fieldState }) => (
										<FormItem>
											<FormLabel>Meta Keywords</FormLabel>
											<FormControl>
												<TagsInput
													value={field.value}
													onValueChange={field.onChange}
													max={MAX_META_KEYWORDS}
													editable
													addOnPaste
													className="w-full"
													aria-invalid={!!fieldState.error}
												>
													<div className="flex sm:flex-row flex-col gap-2">
														<TagsInputList>
															{field.value && Array.isArray(field.value)
																? field.value.map((item) => (
																		<TagsInputItem
																			key={item}
																			value={item}
																		>
																			{item}
																		</TagsInputItem>
																	))
																: null}
															<TagsInputInput placeholder="Add meta keywords..." />
														</TagsInputList>
														<CustomTagsInputClear />
													</div>
													<div className="text-muted-foreground text-sm">
														You can add up to {MAX_META_KEYWORDS} keywords
													</div>
												</TagsInput>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								{/* URL Key */}
								<FormField
									control={control}
									name="meta_details.url_key"
									render={({ field }) => (
										<FormItem>
											<div className="flex gap-2">
												<FormLabel>URL Key</FormLabel>
												<span className="text-muted-foreground text-sm">
													(Without spaces)
												</span>
											</div>
											<FormControl>
												<Input
													disabled
													placeholder="e.g. ferrari-world-abu-dhabi-tour"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* Submit Button */}
						<div className="flex gap-4 justify-end md:col-span-3">
							<Link to={"/tours"} viewTransition prefetch="intent">
								<Button variant={"outline"}>Back</Button>
							</Link>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting && <Loader2 className="animate-spin mr-2" />}
								<span>Update</span>
							</Button>
						</div>
					</Form>
				</form>
			</section>
		</>
	);
}

export type UpdateFormControlType = Control<UpdateTourInput>;
