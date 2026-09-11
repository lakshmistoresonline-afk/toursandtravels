import { useRouteLoaderData, useActionData, useSubmit, useNavigation } from "react-router";
import { clientLoader as rootLoader } from "~/root";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2, Save, User as UserIcon, MapPin } from "lucide-react";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { profileUpdateSchema } from "@workspace/shared/schemas/profile-update.schema";
import { AuthService } from "@workspace/shared/services/auth.service";
import type { FullCurrentUser } from "@workspace/shared/types/user";

export const clientAction = async ({ request }: any) => {
	try {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const authSvc = new AuthService();
		const { user: currentUser } = await authSvc.getFullCurrentUser();

		if (!currentUser) {
			return { success: false, error: "Unauthorized" };
		}

		await authSvc.updateUserProfile({
			...data,
			uid: currentUser.uid,
		} as any);

		return { success: true };
	} catch (err: any) {
		return { success: false, error: err.message || "Failed to update profile" };
	}
};

export default function AccountDetailsPage() {
	const rootData = useRouteLoaderData<typeof rootLoader>("root");
	const actionData = useActionData() as any;
	const submit = useSubmit();
	const navigation = useNavigation();

	const user = rootData?.user as FullCurrentUser | null;
	const isSubmitting = navigation.state === "submitting";

	const form = useForm<any>({
		disabled: isSubmitting,
		resolver: zodResolver(profileUpdateSchema),
		defaultValues: {
			first_name: user?.first_name || "",
			last_name: user?.last_name || "",
			gender: (user?.gender as any) || null,
			date_of_birth: user?.date_of_birth || null,
			phone_number: user?.phone_number || "",
			address_house: user?.address_house || "",
			address_street: user?.address_street || "",
			address_locality: user?.address_locality || "",
			country: user?.country || "",
			aadhar_number: user?.aadhar_number || "",
		},
	});

	const onSubmit = (data: any) => {
		submit(data as any, { method: "post" });
	};

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Spiritual profile saved successfully!");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	if (!user) return null;

	return (
		<div className="space-y-12 max-w-4xl animate-in slide-in-from-right-8 duration-700">
			<MetaDetails metaTitle="Pilgrim Profile | AMBADY" metaDescription="Manage your sacred journey profile." />

			<div className="surface-card p-10 rounded-[2.5rem] flex items-center gap-8 border border-[#d4af37]/10 shadow-2xl">
				<div className="h-24 w-24 rounded-full bg-black/40 border-2 border-[#d4af37]/40 flex items-center justify-center text-[#d4af37] text-4xl font-serif shadow-xl">
					{user.first_name?.charAt(0)}
				</div>
				<div className="space-y-1">
					<h2 className="text-3xl font-serif text-[#fdfcf0] tracking-tight">{user.first_name} {user.last_name}</h2>
					<p className="text-[#fdfcf0]/60 font-sans font-bold text-[10px] uppercase tracking-[0.2em]">{user.email}</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
					{/* Personal Card */}
					<Card className="surface-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
						<div className="px-10 py-6 border-b border-white/5 flex items-center gap-4 bg-white/5">
							<UserIcon className="h-4 w-4 text-[#d4af37]" />
							<h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">Personal Identity</h3>
						</div>
						<CardContent className="p-10 grid sm:grid-cols-2 gap-x-8 gap-y-8">
							<FormField control={form.control} name="first_name" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">First Name</FormLabel><FormControl><Input className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="last_name" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Last Name</FormLabel><FormControl><Input className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="gender" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Gender</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value || ""}>
										<FormControl><SelectTrigger className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus:ring-[#d4af37]/20"><SelectValue /></SelectTrigger></FormControl>
										<SelectContent className="bg-[#0a0e1a] border-[#d4af37]/20 text-[#fdfcf0]">
											<SelectItem value="Male">Male</SelectItem>
											<SelectItem value="Female">Female</SelectItem>
											<SelectItem value="Other">Other</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)} />
							<FormField control={form.control} name="phone_number" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Contact Number</FormLabel><FormControl><Input className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="aadhar_number" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Aadhar Number</FormLabel><FormControl><Input className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					{/* Address Card */}
					<Card className="surface-card border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
						<div className="px-10 py-6 border-b border-white/5 flex items-center gap-4 bg-white/5">
							<MapPin className="h-4 w-4 text-[#d4af37]" />
							<h3 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">Residency</h3>
						</div>
						<CardContent className="p-10 grid sm:grid-cols-2 gap-x-8 gap-y-8">
							<FormField control={form.control} name="address_house" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Flat / House No.</FormLabel><FormControl><Input className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="address_street" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Street Name</FormLabel><FormControl><Input className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="address_locality" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">City / Locality</FormLabel><FormControl><Input className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="country" render={({ field }) => (
								<FormItem className="space-y-3"><FormLabel className="text-[10px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Country</FormLabel><FormControl><Input className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					<div className="flex justify-end pt-6">
						<Button type="submit" className="h-20 px-12 rounded-full bg-[#d4af37] text-[#0a0e1a] text-xs font-bold uppercase tracking-[0.3em] shadow-2xl shadow-[#d4af37]/20 hover:scale-[1.05] transition-all hover:bg-[#b8860b]" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <Save className="mr-3 h-5 w-5" />}
							Update Pilgrim Profile
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
