import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, UserIcon, IdCard, Compass } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	type ActionFunctionArgs,
	Link,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useSubmit,
	useNavigation,
} from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AuthService } from "@workspace/shared/services/auth.service";
import { signupSchema, type SignupFormData } from "@workspace/shared/schemas/signup.schema";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export async function clientAction({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const firstName = (formData.get("firstName") as string)?.trim();
	const lastName = (formData.get("lastName") as string)?.trim();
	const email = (formData.get("email") as string)?.trim();
	const password = (formData.get("password") as string)?.trim();
	const aadharNumber = (formData.get("aadharNumber") as string)?.trim();

	if (!firstName || !lastName || !email || !password || !aadharNumber) {
		return { error: "Required fields are missing", success: false };
	}

	const authSvc = new AuthService();
	const result = await authSvc.signUpWithPasswordAndProfile({
		firstName,
		lastName,
		email,
		password,
		aadharNumber,
	});

	if (result.error) {
		return { error: result.error, success: false };
	}

	return redirect("/login?success=Account created successfully. Please login.");
}

export async function clientLoader({ request }: LoaderFunctionArgs) {
	const { user } = await getCurrentUser(request);
	if (user) return redirect("/");
	return { user: null };
}

export default function SignupPage() {
	const actionData = useActionData() as any;
	const navigation = useNavigation();
	const [showPassword, setShowPassword] = useState(false);

	const isSubmitting = navigation.state === "submitting";

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
			aadharNumber: "",
		},
	});

	const { handleSubmit, control } = form;
	const submit = useSubmit();

	const onFormSubmit = (data: SignupFormData) => {
		const formData = new FormData();
		formData.append("firstName", data.firstName.trim());
		formData.append("lastName", data.lastName.trim());
		formData.append("email", data.email.trim());
		formData.append("password", data.password.trim());
		formData.append("aadharNumber", data.aadharNumber.trim());
		submit(formData, { method: "POST" });
	};

	useEffect(() => {
		if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	return (
		<div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-16 px-4">
			<div className="w-full max-w-xl space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
				<MetaDetails metaTitle="Begin Registration | AMBADY" metaDescription="Join our sacred pilgrimage community." />

				<div className="text-center space-y-3">
					<div className="mx-auto w-16 h-16 rounded-full border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
						<Compass className="h-8 w-8" />
					</div>
					<h2 className="text-3xl font-serif text-[#fdfcf0] tracking-tight uppercase">Begin Your Journey</h2>
					<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em]">
						Create Your Pilgrim Profile
					</p>
				</div>

				<div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl">
					<Form {...form}>
						<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
								<FormField
									control={control}
									name="firstName"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">First Name</FormLabel>
											<FormControl>
												<div className="relative">
													<UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]/40" />
													<Input
														placeholder="First Name"
														className="h-12 pl-12 rounded-xl border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] text-sm"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1" />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="lastName"
									render={({ field }) => (
										<FormItem className="space-y-2">
											<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">Last Name</FormLabel>
											<FormControl>
												<div className="relative">
													<UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]/40" />
													<Input
														placeholder="Last Name"
														className="h-12 pl-12 rounded-xl border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] text-sm"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1" />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={control}
								name="email"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">Email Address</FormLabel>
										<FormControl>
											<div className="relative">
												<MailIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]/40" />
												<Input
													placeholder="pilgrim@example.com"
													className="h-12 pl-12 rounded-xl border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] text-sm"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1" />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="aadharNumber"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">Aadhar Number (12 Digits)</FormLabel>
										<FormControl>
											<div className="relative">
												<IdCard className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]/40" />
												<Input
													placeholder="0000 0000 0000"
													maxLength={12}
													className="h-12 pl-12 rounded-xl border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] text-sm"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1" />
									</FormItem>
								)}
							/>

							<FormField
								control={control}
								name="password"
								render={({ field }) => (
									<FormItem className="space-y-2">
										<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">Create Secret Code</FormLabel>
										<FormControl>
											<div className="relative">
												<LockIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]/40" />
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="••••••••"
													className="h-12 pl-12 pr-12 rounded-xl border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] text-sm"
													{...field}
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-5 top-1/2 -translate-y-1/2 text-[#d4af37]/40 hover:text-[#d4af37] transition-colors"
												>
													{showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
												</button>
											</div>
										</FormControl>
										<FormMessage className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-1" />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full h-14 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] transition-all shadow-lg shadow-[#d4af37]/10" disabled={isSubmitting}>
								{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Complete Registration"}
							</Button>
						</form>
					</Form>

					<div className="mt-8 text-center">
						<p className="text-[#fdfcf0]/30 text-[9px] font-bold uppercase tracking-widest">
							Already a pilgrim?{" "}
							<Link to="/login" className="text-[#d4af37] hover:text-[#fdfcf0] transition-colors ml-1">
								Sign In
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
