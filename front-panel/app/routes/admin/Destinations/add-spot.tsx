import { zodResolver } from "@hookform/resolvers/zod";
import { DestinationSpotSchema } from "@workspace/shared/schemas/spot.schema";
import { SpotsService } from "@workspace/shared/services/spots.service";
import {
	Loader2,
	Plus,
	Info,
	MapPin,
	Tag,
	FileText,
} from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import {
	type ActionFunctionArgs,
	useActionData,
	useNavigate,
	useNavigation,
	useSubmit,
} from "react-router";
import { toast } from "sonner";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Button } from "~/components/ui/button";
import { BackButton } from "~/components/ui/back-button";
import { Card, CardContent } from "~/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Checkbox } from "~/components/ui/checkbox";

export const clientAction = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const payloadRaw = formData.get("payload") as string;
		const payload = JSON.parse(payloadRaw);

		const svc = new SpotsService();
		const spotId = await svc.createSpot(payload);

		return { success: true, spotId };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

export default function AddSpotPage() {
	const navigate = useNavigate();
	const submit = useSubmit();
	const navigation = useNavigation();
	const actionData = useActionData() as any;

	const form = useForm<any>({
		resolver: zodResolver(DestinationSpotSchema),
		defaultValues: {
			spotId: "",
			canonicalName: "",
			alternateNames: [],
			aliases: [],
			domains: ["PILGRIMAGE"],
			category: "PILGRIMAGE",
			subcategory: [],
			geography: {
				region: "South",
				stateUT: "",
				district: "",
				cityLocality: "",
			},
			verification: {
				status: "DISCOVERED",
			},
			status: "draft",
		},
	});

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Master Spot created successfully!");
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
				metaTitle="Add Master Spot | AMBADY Admin"
				metaDescription="Add a new canonical destination to the master inventory."
			/>

			<div className="flex items-center justify-between border-b border-primary/10 pb-8">
				<div className="flex items-center gap-4">
					<BackButton fallbackUrl="/admin/destinations" />
					<div>
						<h1 className="text-4xl font-serif text-foreground tracking-tight leading-tight">
							Add Master Spot
						</h1>
						<p className="text-foreground/40 mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
							Create a new reusable destination entity.
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
													placeholder="e.g. Arulmigu Dhandayuthapani Swamy Temple"
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
													placeholder="e.g. DISC-00001"
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
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
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
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
													placeholder="e.g. Tamil Nadu"
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
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
													placeholder="e.g. Dindigul"
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
													placeholder="e.g. Palani"
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
													placeholder="e.g. Temple, Beach, National Park"
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
							Create Master Spot
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
