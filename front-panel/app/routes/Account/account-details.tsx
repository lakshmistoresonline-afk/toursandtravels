import { useRouteLoaderData, useActionData, useSubmit, useNavigation, useLoaderData } from "react-router";
import { loader as rootLoader } from "~/root";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
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
import { PhoneInput } from "~/components/Booking/phone-number-input";
import { countries } from "country-data-list";
import { ProfileUpdateForm, profileUpdateSchema } from "@workspace/shared/schemas/profile-update.schema";
import { AuthService } from "@workspace/shared/services/auth.service";
import { genAuthSecurity } from "@workspace/shared/utils/auth-utils.server";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { cacheService } from "@workspace/shared/services/cache.service";
import { CACHE_KEYS } from "@workspace/shared/utils/cache-keys";
import type { FullCurrentUser } from "@workspace/shared/types/user";

export async function action({ request }: any) {
	try {
		const formData = await request.formData();
		const data = Object.fromEntries(formData);

		const { authId } = genAuthSecurity(request);
		if (!authId) {
			return { success: false, error: "Unauthorized" };
		}

		const userResult = await getCurrentUser(request);

		if (userResult.error || userResult.user == null) {
			return { success: false, error: "User not found" };
		}

		const authSvc = new AuthService(request);
		await authSvc.updateUserProfile({
			...data,
			user_id: userResult.user.id,
		} as any);

		await cacheService.invalidate(CACHE_KEYS.auth.session("FP", authId));

		return { success: true, error: null };
	} catch (err: any) {
		return { success: false, error: err.message || "Failed to update profile" };
	}
}

export interface Country {
	alpha2: string;
	alpha3: string;
	countryCallingCodes: string[];
	currencies: string[];
	emoji?: string;
	ioc: string;
	languages: string[];
	name: string;
	status: string;
}

export const loader = () => {
	const countries_list = countries.all.filter(
		(country: Country) => country.emoji && country.status !== "deleted" && country.ioc !== "PRK",
	);

	return { countries_list };
};

export default function AccountDetailsPage() {
	const rootData = useRouteLoaderData<typeof rootLoader>("root");
	const { countries_list } = useLoaderData<typeof loader>();
	const actionData = useActionData();
	const submit = useSubmit();
	const navigation = useNavigation();

	const user = rootData?.user as FullCurrentUser | null;

	if (!user) return null;

	const isSubmitting = navigation.state === "submitting";

	const form = useForm<ProfileUpdateForm>({
		disabled: isSubmitting,
		resolver: zodResolver(profileUpdateSchema),
		defaultValues: {
			first_name: user.first_name || "",
			last_name: user.last_name || "",
			gender: (user.gender as any) || null,
			date_of_birth: user.date_of_birth || null,
			phone_number: user.phone_number || "",
			whatsapp_number: user.whatsapp_number || "",
			address_house: user.address_house || "",
			address_street: user.address_street || "",
			address_locality: user.address_locality || "",
			address_post_office: user.address_post_office || "",
			address_district: user.address_district || "",
			address_state: user.address_state || "",
			address_pin_code: user.address_pin_code || "",
			country: user.country || "",
			identity_type: user.identity_type || "",
			identity_number: user.identity_number || "",
			emergency_contact_name: user.emergency_contact_name || "",
			emergency_contact_number: user.emergency_contact_number || "",
			emergency_contact_relationship: user.emergency_contact_relationship || "",
			avatar_url: user.avatar_url || null,
		},
	});

	const onSubmit = (data: ProfileUpdateForm) => {
		submit(data as any, { method: "post" });
	};

	useEffect(() => {
		if (actionData) {
			if (actionData.success) {
				toast.success("Profile updated successfully!");
			} else if (actionData.error) {
				toast.error(actionData.error);
			}
		}
	}, [actionData]);

	return (
		<>
			<MetaDetails
				metaTitle="Account Details | WanderNest"
				metaDescription="My account information"
				metaKeywords="WanderNest"
			/>

			<div className="space-y-6 max-w-4xl mx-auto">
				<h1 className="text-3xl font-bold">My Profile</h1>

				<Form {...form}>
					<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
						{/* Personal Details */}
						<Card>
							<CardHeader>
								<CardTitle>Personal Details</CardTitle>
								<CardDescription>Basic information for your registrations.</CardDescription>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid sm:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="first_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>First Name</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="last_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Last Name</FormLabel>
												<FormControl>
													<Input {...field} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid sm:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="gender"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Gender</FormLabel>
												<Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
													<FormControl>
														<SelectTrigger>
															<SelectValue placeholder="Select gender" />
														</SelectTrigger>
													</FormControl>
													<SelectContent>
														<SelectItem value="Male">Male</SelectItem>
														<SelectItem value="Female">Female</SelectItem>
														<SelectItem value="Other">Other</SelectItem>
													</SelectContent>
												</Select>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="date_of_birth"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Date of Birth</FormLabel>
												<FormControl>
													<Input type="date" {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Contact Information */}
						<Card>
							<CardHeader>
								<CardTitle>Contact Information</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid sm:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="phone_number"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Mobile Number</FormLabel>
												<FormControl>
													<PhoneInput {...field} placeholder="Phone Number" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="whatsapp_number"
										render={({ field }) => (
											<FormItem>
												<FormLabel>WhatsApp Number</FormLabel>
												<FormControl>
													<PhoneInput {...field} placeholder="WhatsApp Number" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Address */}
						<Card>
							<CardHeader>
								<CardTitle>Address</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid sm:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="address_house"
										render={({ field }) => (
											<FormItem>
												<FormLabel>House/Building</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="address_street"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Street</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<div className="grid sm:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="address_locality"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Locality</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="address_district"
										render={({ field }) => (
											<FormItem>
												<FormLabel>District</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="address_pin_code"
										render={({ field }) => (
											<FormItem>
												<FormLabel>PIN Code</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
								<FormField
									control={form.control}
									name="country"
									render={({ field }) => (
										<FormItem>
											<FormLabel>Country</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
												<FormControl>
													<SelectTrigger>
														<SelectValue placeholder="Select country" />
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{countries_list.map((c: any) => (
														<SelectItem key={c.alpha3} value={c.alpha3}>
															{c.emoji} {c.name}
														</SelectItem>
													))}
												</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>
							</CardContent>
						</Card>

						{/* Identity & Travel */}
						<Card>
							<CardHeader>
								<CardTitle>Identity & Travel</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid sm:grid-cols-2 gap-4">
									<FormField
										control={form.control}
										name="identity_type"
										render={({ field }) => (
											<FormItem>
												<FormLabel>ID Type</FormLabel>
												<FormControl>
													<Input placeholder="e.g. Passport, National ID" {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="identity_number"
										render={({ field }) => (
											<FormItem>
												<FormLabel>ID Number</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						{/* Emergency Contact */}
						<Card>
							<CardHeader>
								<CardTitle>Emergency Contact</CardTitle>
							</CardHeader>
							<CardContent className="space-y-4">
								<div className="grid sm:grid-cols-3 gap-4">
									<FormField
										control={form.control}
										name="emergency_contact_name"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Name</FormLabel>
												<FormControl>
													<Input {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="emergency_contact_number"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Phone Number</FormLabel>
												<FormControl>
													<PhoneInput {...field} placeholder="Phone Number" />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
									<FormField
										control={form.control}
										name="emergency_contact_relationship"
										render={({ field }) => (
											<FormItem>
												<FormLabel>Relationship</FormLabel>
												<FormControl>
													<Input placeholder="e.g. Spouse, Parent" {...field} value={field.value || ""} />
												</FormControl>
												<FormMessage />
											</FormItem>
										)}
									/>
								</div>
							</CardContent>
						</Card>

						<div className="flex justify-end">
							<Button type="submit" size="lg" disabled={isSubmitting}>
								{isSubmitting ? (
									<>
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										Saving...
									</>
								) : (
									<>
										<Save className="mr-2 h-4 w-4" />
										Save Profile
									</>
								)}
							</Button>
						</div>
					</form>
				</Form>
			</div>
		</>
	);
}
