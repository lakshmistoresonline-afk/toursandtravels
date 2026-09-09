import { useRouteLoaderData, useActionData, useSubmit, useNavigation } from "react-router";
import { loader as rootLoader } from "~/root";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2, Save, User as UserIcon, MapPin, Phone } from "lucide-react";
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
		},
	});

	const onSubmit = (data: any) => {
		submit(data as any, { method: "post" });
	};

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Profile saved successfully!");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	if (!user) return null;

	return (
		<div className="space-y-8 max-w-3xl animate-in slide-in-from-right-4 duration-500">
			<MetaDetails metaTitle="Profile | WanderNest" />

			<div className="bg-primary/5 p-8 rounded-3xl flex items-center gap-6 border border-primary/10">
				<div className="h-20 w-20 rounded-2xl bg-primary flex items-center justify-center text-white text-3xl font-black shadow-xl shadow-primary/20">
					{user.first_name?.charAt(0)}
				</div>
				<div>
					<h2 className="text-2xl font-black text-slate-900">{user.first_name} {user.last_name}</h2>
					<p className="text-slate-500 font-medium">{user.email}</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					{/* Personal Card */}
					<Card className="border-none shadow-sm rounded-3xl overflow-hidden">
						<CardHeader className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex flex-row items-center gap-3">
							<UserIcon className="h-5 w-5 text-slate-400" />
							<CardTitle className="text-lg font-bold">Personal Information</CardTitle>
						</CardHeader>
						<CardContent className="p-8 grid sm:grid-cols-2 gap-6">
							<FormField control={form.control} name="first_name" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-600">First Name</FormLabel><FormControl><Input className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="last_name" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-600">Last Name</FormLabel><FormControl><Input className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="gender" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-600">Gender</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value || ""}>
										<FormControl><SelectTrigger className="h-12 rounded-xl"><SelectValue /></SelectTrigger></FormControl>
										<SelectContent className="rounded-xl">
											<SelectItem value="Male">Male</SelectItem>
											<SelectItem value="Female">Female</SelectItem>
											<SelectItem value="Other">Other</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)} />
							<FormField control={form.control} name="phone_number" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-600">Contact Number</FormLabel><FormControl><Input className="h-12 rounded-xl" {...field} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					{/* Address Card */}
					<Card className="border-none shadow-sm rounded-3xl overflow-hidden">
						<CardHeader className="bg-slate-50 px-8 py-6 border-b border-slate-100 flex flex-row items-center gap-3">
							<MapPin className="h-5 w-5 text-slate-400" />
							<CardTitle className="text-lg font-bold">Residency Address</CardTitle>
						</CardHeader>
						<CardContent className="p-8 grid sm:grid-cols-2 gap-6">
							<FormField control={form.control} name="address_house" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-600">Flat / House No.</FormLabel><FormControl><Input className="h-12 rounded-xl" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="address_street" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-600">Street Name</FormLabel><FormControl><Input className="h-12 rounded-xl" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="address_locality" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-600">City / Locality</FormLabel><FormControl><Input className="h-12 rounded-xl" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="country" render={({ field }) => (
								<FormItem><FormLabel className="font-bold text-slate-600">Country</FormLabel><FormControl><Input className="h-12 rounded-xl" {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					<div className="flex justify-end pt-4">
						<Button type="submit" size="lg" className="rounded-2xl px-10 py-7 text-lg font-black shadow-xl shadow-primary/30 hover:scale-105 transition-transform" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Save className="mr-2 h-5 w-5" />}
							Update My Profile
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
