import { zodResolver } from "@hookform/resolvers/zod";
import { DestinationSpotSchema } from "@workspace/shared/schemas/spot.schema";
import { SpotsService } from "@workspace/shared/services/spots.service";
import { ToursService } from "@workspace/shared/services/tours.service";
import {
	Loader2,
	Save,
	Info,
	MapPin,
	Tag,
	Compass,
	FileText,
	ShieldCheck,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
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
import { BackButton } from "~/components/ui/back-button";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
	const svc = new SpotsService();
	const tourSvc = new ToursService();
	const spot = await svc.getSpotById(params.id!);
	if (!spot) throw new Error("Spot not found");

	const relatedTours = await tourSvc.getToursBySpotId(params.id!);

	// Fetch source info (mocked or from a service if available)
	const sourceInfo = "SRC-001: Incredible India - Primary Harvest";

	return { spot, relatedTours, sourceInfo };
};

export const clientAction = async ({ request, params }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const payloadRaw = formData.get("payload") as string;
		const payload = JSON.parse(payloadRaw);

		const svc = new SpotsService();
		await svc.updateSpot(params.id!, payload);

		return { success: true };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

export default function EditSpotPage() {
	const { spot, relatedTours, sourceInfo } = useLoaderData<typeof clientLoader>();
	const navigate = useNavigate();
	const submit = useSubmit();
	const navigation = useNavigation();
	const actionData = useActionData() as any;

	const form = useForm<any>({
		resolver: zodResolver(DestinationSpotSchema),
		defaultValues: {
			...spot,
			verification: spot.verification || { status: "DISCOVERED" },
		},
	});

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Master Spot updated successfully!");
			navigate("/admin/destinations");
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
				metaTitle={`Edit ${spot.canonicalName} | AMBADY Admin`}
				metaDescription="Modify canonical destination details."
			/>

			<div className="flex items-center justify-between border-b border-primary/10 pb-8">
				<div className="flex items-center gap-4">
					<BackButton fallbackUrl="/admin/destinations" />
					<div>
						<h1 className="text-4xl font-serif text-foreground tracking-tight leading-tight">
							Edit Master Spot
						</h1>
						<p className="text-foreground/40 mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
							Refining {spot.canonicalName}
						</p>
					</div>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
					{/* Basic Identity */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<Info className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Identity & Classification
							</h3>
						</div>
						<CardContent className="p-10 space-y-10">
							<div className="grid md:grid-cols-2 gap-10">
								<FormField
									control={form.control}
									name="canonicalName"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Canonical Name
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
									control={form.control}
									name="spotId"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Stable Spot ID
											</FormLabel>
											<FormControl>
												<Input
													className="h-14 rounded-2xl border-primary/10 bg-primary/5 text-primary font-mono font-bold px-6 shadow-none pointer-events-none"
													{...field}
													readOnly
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid md:grid-cols-2 gap-10">
								<FormField
									control={form.control}
									name="domains"
									render={() => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Domains
											</FormLabel>
											<div className="flex gap-6 pt-2">
												{["PILGRIMAGE", "TOURIST"].map((domain) => (
													<FormField
														key={domain}
														control={form.control}
														name="domains"
														render={({ field }) => (
															<FormItem
																key={domain}
																className="flex flex-row items-start space-x-3 space-y-0"
															>
																<FormControl>
																	<Checkbox
																		checked={field.value?.includes(domain)}
																		onCheckedChange={(checked) => {
																			return checked
																				? field.onChange([...field.value, domain])
																				: field.onChange(
																						field.value?.filter(
																							(value: string) => value !== domain
																						)
																				  );
																		}}
																	/>
																</FormControl>
																<FormLabel className="text-[10px] font-bold uppercase tracking-widest cursor-pointer">
																	{domain}
																</FormLabel>
															</FormItem>
														)}
													/>
												))}
											</div>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="importance"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Importance
											</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus:ring-primary/20 shadow-sm">
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-white border-primary/20 text-foreground">
													<SelectItem value="MAJOR">Major Destination</SelectItem>
													<SelectItem value="REGIONAL">Regional Significance</SelectItem>
													<SelectItem value="LOCAL">Local Spot</SelectItem>
													<SelectItem value="UNRANKED">Unranked</SelectItem>
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Geography */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<MapPin className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Geographic Hierarchy
							</h3>
						</div>
						<CardContent className="p-10 space-y-10">
							<div className="grid md:grid-cols-2 gap-10">
								<FormField
									control={form.control}
									name="geography.region"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Region
											</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus:ring-primary/20 shadow-sm">
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-white border-primary/20 text-foreground">
													<SelectItem value="North">North India</SelectItem>
													<SelectItem value="South">South India</SelectItem>
													<SelectItem value="East">East India</SelectItem>
													<SelectItem value="West">West India</SelectItem>
													<SelectItem value="Central">Central India</SelectItem>
													<SelectItem value="Northeast">Northeast India</SelectItem>
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="geography.stateUT"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												State / UT
											</FormLabel>
											<FormControl>
												<Input
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>

							<div className="grid md:grid-cols-2 gap-10">
								<FormField
									control={form.control}
									name="geography.district"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												District
											</FormLabel>
											<FormControl>
												<Input
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="geography.cityLocality"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												City / Town
											</FormLabel>
											<FormControl>
												<Input
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Metadata */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<Tag className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Spiritual & Categorical Metadata
							</h3>
						</div>
						<CardContent className="p-10 space-y-10">
							<div className="grid md:grid-cols-2 gap-10">
								<FormField
									control={form.control}
									name="category"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Primary Category
											</FormLabel>
											<FormControl>
												<Input
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>
								<FormField
									control={form.control}
									name="verification.status"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Verification Status
											</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus:ring-primary/20 shadow-sm">
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-white border-primary/20 text-foreground">
													<SelectItem value="DISCOVERED">Discovered</SelectItem>
													<SelectItem value="VERIFIED">Verified</SelectItem>
													<SelectItem value="PUBLISHED">Published</SelectItem>
													<SelectItem value="ARCHIVED">Archived</SelectItem>
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
							</div>
						</CardContent>
					</Card>

					{/* Narrative */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<FileText className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Description & Significance
							</h3>
						</div>
						<CardContent className="p-10">
							<FormField
								control={form.control}
								name="description"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Overview
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe the spot..."
												className="min-h-[150px] p-6 rounded-[2rem] border-primary/20 bg-white text-foreground text-sm resize-none focus:ring-primary/20 leading-relaxed shadow-sm"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Provenance */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<ShieldCheck className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Provenance & Data Integrity
							</h3>
						</div>
						<CardContent className="p-10 space-y-6">
							<div className="p-6 rounded-2xl bg-primary/5 border border-primary/10">
								<p className="text-[10px] font-bold uppercase tracking-widest text-primary mb-2">Original Source Metadata</p>
								<p className="text-xs text-foreground/70 leading-relaxed font-medium mb-4">
									{spot.verification?.notes || "No original source notes available."}
								</p>
								<p className="text-[8px] font-bold uppercase tracking-widest text-foreground/30">Authoritative Source Identifier</p>
								<p className="text-[10px] font-bold text-primary">{sourceInfo}</p>
							</div>
							<div className="grid md:grid-cols-2 gap-10">
								<div className="space-y-2">
									<p className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 ml-2">Imported At</p>
									<p className="text-sm font-mono font-bold text-foreground/60 bg-white p-4 rounded-xl border border-primary/5">{spot.createdAt}</p>
								</div>
								<div className="space-y-2">
									<p className="text-[9px] font-bold uppercase tracking-widest text-foreground/30 ml-2">Last Processed</p>
									<p className="text-sm font-mono font-bold text-foreground/60 bg-white p-4 rounded-xl border border-primary/5">{spot.updatedAt}</p>
								</div>
							</div>
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
								<Save className="mr-4 h-6 w-6" />
							)}
							Update Master Spot
						</Button>
					</div>
				</form>
			</Form>

			{/* Related Journeys */}
			<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl mt-12">
				<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
					<Compass className="h-4.5 w-4.5 text-primary" />
					<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
						Usage: Journeys referencing this Spot
					</h3>
				</div>
				<CardContent className="p-10">
					{relatedTours.length === 0 ? (
						<div className="py-12 text-center opacity-30">
							<p className="text-[10px] font-bold uppercase tracking-widest">
								This master spot is not currently used in any journeys.
							</p>
						</div>
					) : (
						<div className="grid gap-4">
							{relatedTours.map((t) => (
								<Link
									key={t.id}
									to={`/admin/tours/edit/${t.id}`}
									className="p-6 rounded-2xl bg-primary/[0.02] border border-primary/10 hover:border-primary/30 transition-all flex items-center justify-between group"
								>
									<div className="flex flex-col gap-0.5">
										<span className="font-bold text-foreground group-hover:text-primary transition-colors">
											{t.name}
										</span>
										<span className="text-[10px] font-mono text-foreground/40">
											{t.tour_code}
										</span>
									</div>
									<Badge className="text-[8px] font-bold uppercase tracking-widest bg-primary/10 text-primary border-none shadow-none">
										{t.status}
									</Badge>
								</Link>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
}

