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
import { Loader2, Save, User as UserIcon, MapPin, Bell } from "lucide-react";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { profileUpdateSchema } from "@workspace/shared/schemas/profile-update.schema";
import { AuthService } from "@workspace/shared/services/auth.service";
import type { FullCurrentUser } from "@workspace/shared/types/user";
import { Switch } from "~/components/ui/switch";

export const clientAction = async ({ request }: any) => {
	try {
		const formData = await request.formData();
		const rawData = Object.fromEntries(formData);

		// Handle nested notifications
		const data: any = { ...rawData };
		data.notifications = {
			journeyAnnouncements: formData.get("notifications.journeyAnnouncements") === "on",
			registrationUpdates: formData.get("notifications.registrationUpdates") === "on",
			journeyChanges: formData.get("notifications.journeyChanges") === "on",
		};

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
			notifications: {
				journeyAnnouncements: user?.notifications?.journeyAnnouncements ?? true,
				registrationUpdates: user?.notifications?.registrationUpdates ?? true,
				journeyChanges: user?.notifications?.journeyChanges ?? true,
			},
		},
	});

	const onSubmit = (data: any) => {
		const formData = new FormData();
		Object.entries(data).forEach(([key, value]) => {
			if (key === "notifications") {
				Object.entries(value as any).forEach(([nKey, nValue]) => {
					formData.append(`notifications.${nKey}`, nValue ? "on" : "off");
				});
			} else {
				formData.append(key, value as any);
			}
		});
		submit(formData, { method: "post" });
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
			<MetaDetails
				metaTitle="Pilgrim Profile | AMBADY"
				metaDescription="Manage your sacred journey profile."
			/>

			<div className="bg-card p-10 md:p-14 rounded-[3rem] flex items-center gap-10 border border-primary/10 shadow-xl">
				<div className="h-28 w-28 rounded-full bg-primary/5 border-2 border-primary/20 flex items-center justify-center text-primary text-4xl font-serif shadow-sm">
					{user.first_name?.charAt(0)}
				</div>
				<div className="space-y-2">
					<h2 className="text-4xl font-serif text-foreground tracking-tight">
						{user.first_name} {user.last_name}
					</h2>
					<p className="text-primary font-bold text-[11px] uppercase tracking-[0.2em]">
						{user.email}
					</p>
				</div>
			</div>

			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-12">
					{/* Personal Card */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<UserIcon className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Personal Identity
							</h3>
						</div>
						<CardContent className="p-10 grid sm:grid-cols-2 gap-x-10 gap-y-10">
							<FormField
								control={form.control}
								name="first_name"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											First Name
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
								name="last_name"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Last Name
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
								name="gender"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Gender
										</FormLabel>
										<Select
											onValueChange={field.onChange}
											defaultValue={field.value || ""}
										>
											<FormControl>
												<SelectTrigger className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus:ring-primary/20 shadow-sm">
													<SelectValue />
												</SelectTrigger>
											</FormControl>
											<SelectContent className="bg-white border-primary/20 text-foreground">
												<SelectItem value="Male">Male</SelectItem>
												<SelectItem value="Female">Female</SelectItem>
												<SelectItem value="Other">Other</SelectItem>
											</SelectContent>
										</Select>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="phone_number"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Contact Number
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
								name="aadhar_number"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Aadhar Number
										</FormLabel>
										<FormControl>
											<Input
												className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Address Card */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<MapPin className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Residency
							</h3>
						</div>
						<CardContent className="p-10 grid sm:grid-cols-2 gap-x-10 gap-y-10">
							<FormField
								control={form.control}
								name="address_house"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Flat / House No.
										</FormLabel>
										<FormControl>
											<Input
												className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="address_street"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Street Name
										</FormLabel>
										<FormControl>
											<Input
												className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="address_locality"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											City / Locality
										</FormLabel>
										<FormControl>
											<Input
												className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="country"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Country
										</FormLabel>
										<FormControl>
											<Input
												className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
												{...field}
												value={field.value || ""}
											/>
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					{/* Notification Preferences */}
					<Card className="bg-card border border-primary/10 rounded-[3rem] overflow-hidden shadow-xl">
						<div className="px-10 py-7 border-b border-primary/10 flex items-center gap-4 bg-primary/5">
							<Bell className="h-4.5 w-4.5 text-primary" />
							<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
								Notification Preferences
							</h3>
						</div>
						<CardContent className="p-10 space-y-8">
							<FormField
								control={form.control}
								name="notifications.journeyAnnouncements"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-2xl border border-primary/5 p-4 bg-primary/[0.02]">
										<div className="space-y-0.5">
											<FormLabel className="text-sm font-bold uppercase tracking-widest text-foreground">
												Journey Announcements
											</FormLabel>
											<p className="text-xs text-foreground/40">
												Receive emails about new pilgrimage journeys and sacred paths.
											</p>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="notifications.registrationUpdates"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-2xl border border-primary/5 p-4 bg-primary/[0.02]">
										<div className="space-y-0.5">
											<FormLabel className="text-sm font-bold uppercase tracking-widest text-foreground">
												Registration Updates
											</FormLabel>
											<p className="text-xs text-foreground/40">
												Receive updates about your pilgrimage registrations and status
												changes.
											</p>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
							<FormField
								control={form.control}
								name="notifications.journeyChanges"
								render={({ field }) => (
									<FormItem className="flex flex-row items-center justify-between rounded-2xl border border-primary/5 p-4 bg-primary/[0.02]">
										<div className="space-y-0.5">
											<FormLabel className="text-sm font-bold uppercase tracking-widest text-foreground">
												Journey Changes
											</FormLabel>
											<p className="text-xs text-foreground/40">
												Receive alerts if there are significant changes to your
												registered journeys.
											</p>
										</div>
										<FormControl>
											<Switch checked={field.value} onCheckedChange={field.onChange} />
										</FormControl>
									</FormItem>
								)}
							/>
						</CardContent>
					</Card>

					<div className="flex justify-end pt-8">
						<Button
							type="submit"
							className="h-20 px-16 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.05] transition-all hover:bg-primary/90"
							disabled={isSubmitting}
						>
							{isSubmitting ? (
								<Loader2 className="animate-spin mr-3 h-6 w-6" />
							) : (
								<Save className="mr-3 h-6 w-6" />
							)}
							Update Pilgrim Profile
						</Button>
					</div>
				</form>
			</Form>
		</div>
	);
}
