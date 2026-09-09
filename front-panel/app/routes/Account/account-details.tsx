import { useRouteLoaderData, useActionData, useSubmit, useNavigation } from "react-router";
import { loader as rootLoader } from "~/root";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useEffect } from "react";
import { Loader2, Save } from "lucide-react";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { ProfileUpdateForm, profileUpdateSchema } from "@workspace/shared/schemas/profile-update.schema";
import { AuthService } from "@workspace/shared/services/auth.service";
import type { FullCurrentUser } from "@workspace/shared/types/user";

export async function clientAction({ request }: any) {
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
}

export default function AccountDetailsPage() {
	const rootData = useRouteLoaderData<typeof rootLoader>("root");
	const actionData = useActionData() as any;
	const submit = useSubmit();
	const navigation = useNavigation();

	const user = rootData?.user as FullCurrentUser | null;

	const isSubmitting = navigation.state === "submitting";

	const form = useForm<ProfileUpdateForm>({
		disabled: isSubmitting,
		resolver: zodResolver(profileUpdateSchema),
		defaultValues: {
			first_name: user?.first_name || "",
			last_name: user?.last_name || "",
			gender: (user?.gender as any) || null,
			date_of_birth: user?.date_of_birth || null,
			phone_number: user?.phone_number || "",
			whatsapp_number: user?.whatsapp_number || "",
			address_house: user?.address_house || "",
			address_street: user?.address_street || "",
			address_locality: user?.address_locality || "",
			address_district: user?.address_district || "",
			address_state: user?.address_state || "",
			address_pin_code: user?.address_pin_code || "",
			country: user?.country || "",
			identity_type: user?.identity_type || "",
			identity_number: user?.identity_number || "",
			emergency_contact_name: user?.emergency_contact_name || "",
			emergency_contact_number: user?.emergency_contact_number || "",
			emergency_contact_relationship: user?.emergency_contact_relationship || "",
			avatar_url: user?.avatar_url || null,
		},
	});

	const onSubmit = (data: ProfileUpdateForm) => {
		submit(data as any, { method: "post" });
	};

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Profile updated successfully!");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	if (!user) return <div className="text-center py-20">Please login to view profile.</div>;

	return (
		<div className="space-y-6 max-w-4xl mx-auto px-4">
			<MetaDetails metaTitle="Account Details | WanderNest" />
			<h1 className="text-3xl font-bold">My Profile</h1>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
					<Card>
						<CardHeader>
							<CardTitle>Personal Details</CardTitle>
							<CardDescription>Keep your profile updated for faster registrations.</CardDescription>
						</CardHeader>
						<CardContent className="grid sm:grid-cols-2 gap-4">
							<FormField control={form.control} name="first_name" render={({ field }) => (
								<FormItem><FormLabel>First Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="last_name" render={({ field }) => (
								<FormItem><FormLabel>Last Name</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="phone_number" render={({ field }) => (
								<FormItem><FormLabel>Mobile</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="gender" render={({ field }) => (
								<FormItem><FormLabel>Gender</FormLabel>
									<Select onValueChange={field.onChange} defaultValue={field.value || ""}>
										<FormControl><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger></FormControl>
										<SelectContent>
											<SelectItem value="Male">Male</SelectItem>
											<SelectItem value="Female">Female</SelectItem>
											<SelectItem value="Other">Other</SelectItem>
										</SelectContent>
									</Select>
								</FormItem>
							)} />
						</CardContent>
					</Card>

					<Card>
						<CardHeader><CardTitle>Address Information</CardTitle></CardHeader>
						<CardContent className="grid sm:grid-cols-2 gap-4">
							<FormField control={form.control} name="address_house" render={({ field }) => (
								<FormItem><FormLabel>House No.</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="address_street" render={({ field }) => (
								<FormItem><FormLabel>Street</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="address_locality" render={({ field }) => (
								<FormItem><FormLabel>Locality</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
							<FormField control={form.control} name="country" render={({ field }) => (
								<FormItem><FormLabel>Country</FormLabel><FormControl><Input {...field} value={field.value || ""} /></FormControl></FormItem>
							)} />
						</CardContent>
					</Card>

					<div className="flex justify-end">
						<Button type="submit" size="lg" disabled={isSubmitting}>
							{isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
							Save Changes
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
