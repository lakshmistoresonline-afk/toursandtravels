import { zodResolver } from "@hookform/resolvers/zod";
import { CircuitSchema } from "@workspace/shared/schemas/circuit.schema";
import { CircuitsService } from "@workspace/shared/services/circuits.service";
import {
	Loader2,
	Plus,
	Info,
	Trash2,
} from "lucide-react";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
import { SpotSearch } from "~/components/Admin/SpotSearch";

export const clientAction = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const payloadRaw = formData.get("payload") as string;
		const payload = JSON.parse(payloadRaw);

		const svc = new CircuitsService();
		const id = await svc.createCircuit(payload);

		return { success: true, id };
	} catch (error: any) {
		return { success: false, error: error.message };
	}
};

export default function AddCircuitPage() {
	const navigate = useNavigate();
	const submit = useSubmit();
	const navigation = useNavigation();
	const actionData = useActionData() as any;

	const form = useForm<any>({
		resolver: zodResolver(CircuitSchema),
		defaultValues: {
			name: "",
			domain: "PILGRIMAGE",
			spotIds: [],
			defaultDurationDays: 5,
			description: "",
			status: "draft",
		},
	});

	const { control, handleSubmit } = form;
	const { fields, append, remove } = useFieldArray({
		control,
		name: "spotIds" as any,
	});

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Circuit created successfully!");
			navigate("/admin/circuits");
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
				metaTitle="Add Master Circuit | AMBADY Admin"
				metaDescription="Create a new reusable travel circuit."
			/>

			<div className="flex items-center justify-between border-b border-primary/10 pb-8">
				<div className="flex items-center gap-4">
					<BackButton fallbackUrl="/admin/circuits" />
					<div>
						<h1 className="text-4xl font-serif text-foreground tracking-tight leading-tight">
							Add Master Circuit
						</h1>
						<p className="text-foreground/40 mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
							Define a reusable path of destinations.
						</p>
					</div>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onSubmit)} className="space-y-12">
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<Info className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Circuit Information
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
												Circuit Name
											</FormLabel>
											<FormControl>
												<Input
													placeholder="e.g. Char Dham Yatra"
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
													{...field}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="domain"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Domain
											</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus:ring-primary/20 shadow-sm">
														<SelectValue />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-white border-primary/20 text-foreground">
													<SelectItem value="PILGRIMAGE">Pilgrimage</SelectItem>
													<SelectItem value="TOURIST">Tourist</SelectItem>
												</SelectContent>
											</Select>
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={control}
								name="description"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Description
										</FormLabel>
										<FormControl>
											<Textarea
												placeholder="Describe the significance of this circuit..."
												className="min-h-[120px] rounded-[2rem] border-primary/20 bg-white text-foreground focus:ring-primary/20 shadow-sm"
												{...field}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center justify-between bg-primary/5">
							<div className="flex items-center gap-4">
								<Plus className="h-4.5 w-4.5 text-primary" />
								<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
									Destinations in Circuit
								</h3>
							</div>
							<Button
								type="button"
								variant="outline"
								size="sm"
								onClick={() => append("")}
								className="rounded-full border-primary/20 text-primary hover:bg-primary/5 text-[9px] font-bold uppercase tracking-widest px-6 h-10"
							>
								Add Stop
							</Button>
						</div>
						<CardContent className="p-10 space-y-6">
							{fields.length === 0 && (
								<p className="text-center py-10 text-foreground/30 text-xs font-bold uppercase tracking-widest">
									No destinations added yet.
								</p>
							)}
							{fields.map((field, index) => (
								<div key={field.id} className="flex items-center gap-4 animate-in slide-in-from-right-4 duration-300">
									<div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
										{index + 1}
									</div>
									<div className="flex-1">
										<SpotSearch
											onSelect={(spot) => {
												const newSpotIds = [...form.getValues("spotIds")];
												newSpotIds[index] = spot.spotId;
												form.setValue("spotIds", newSpotIds);
											}}
											defaultValue={form.getValues(`spotIds.${index}`)}
											placeholder="Select destination..."
											className="h-12 rounded-xl"
										/>
									</div>
									<Button
										type="button"
										variant="ghost"
										size="icon"
										className="text-red-500 hover:bg-red-50 rounded-full"
										onClick={() => remove(index)}
									>
										<Trash2 className="h-5 w-5" />
									</Button>
								</div>
							))}
							<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3">
								{form.formState.errors.spotIds?.message as string}
							</FormMessage>
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
							Create Master Circuit
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
