import {
	EyeIcon,
	EyeOffIcon,
	Loader2,
	LockIcon,
	MailIcon,
	UserIcon,
	IdCard,
	Compass,
	PhoneIcon,
	CalendarIcon,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { BackButton } from "~/components/ui/back-button";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AuthService } from "@workspace/shared/services/auth.service";
import { signupSchema, type SignupFormData } from "@workspace/shared/schemas/signup.schema";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export async function clientAction({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const firstName = (formData.get("firstName") as string)?.trim();
	const lastName = (formData.get("lastName") as string)?.trim();
	const email = (formData.get("email") as string)?.trim();
	const phone = (formData.get("phone") as string)?.trim();
	const password = (formData.get("password") as string)?.trim();
	const aadharNumber = (formData.get("aadharNumber") as string)?.trim();
	const gender = (formData.get("gender") as string)?.trim();
	const dateOfBirth = (formData.get("dateOfBirth") as string)?.trim();

	if (
		!firstName ||
		!lastName ||
		!email ||
		!phone ||
		!password ||
		!aadharNumber ||
		!gender ||
		!dateOfBirth
	) {
		return { error: "Required fields are missing", success: false };
	}

	const authSvc = new AuthService();
	const result = await authSvc.signUpWithPasswordAndProfile({
		firstName,
		lastName,
		email,
		phone,
		password,
		aadharNumber,
		gender: gender as any,
		dateOfBirth,
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
			phone: "",
			password: "",
			aadharNumber: "",
			gender: "" as any,
			dateOfBirth: "",
		},
	});

	const { handleSubmit, control } = form;
	const submit = useSubmit();

	const onFormSubmit = (data: SignupFormData) => {
		const formData = new FormData();
		formData.append("firstName", data.firstName.trim());
		formData.append("lastName", data.lastName.trim());
		formData.append("email", data.email.trim());
		formData.append("phone", data.phone.trim());
		formData.append("password", data.password.trim());
		formData.append("aadharNumber", data.aadharNumber.trim());
		formData.append("gender", data.gender);
		formData.append("dateOfBirth", data.dateOfBirth);
		submit(formData, { method: "POST" });
	};

	useEffect(() => {
		if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	return (
		<div className="min-h-[90vh] w-full flex items-center justify-center py-24 px-6 bg-background relative">
			<div className="absolute top-10 left-10">
				<BackButton fallbackUrl="/login" label="Back to Login" />
			</div>
			<div className="w-full max-w-3xl space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
				<MetaDetails
					metaTitle="Begin Registration | AMBADY"
					metaDescription="Join our sacred pilgrimage community."
				/>

				<div className="text-center space-y-4">
					<Link to="/" className="inline-flex items-center gap-3 group">
						<div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500 shadow-sm">
							<Compass className="h-8 w-8" />
						</div>
					</Link>
					<div className="space-y-2">
						<h2 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">
							Begin Your Journey
						</h2>
						<p className="text-[11px] font-bold text-primary uppercase tracking-[0.4em]">
							Create Your Pilgrim Profile
						</p>
					</div>
				</div>

				<div className="bg-card p-10 md:p-16 rounded-[3rem] shadow-xl border border-primary/10">
					<Form {...form}>
						<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
								<FormField
									control={control}
									name="firstName"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												First Name
											</FormLabel>
											<FormControl>
												<div className="relative group">
													<UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
													<Input
														placeholder="First Name"
														className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 text-base px-14 shadow-sm"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="lastName"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Last Name
											</FormLabel>
											<FormControl>
												<div className="relative group">
													<UserIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
													<Input
														placeholder="Last Name"
														className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 text-base px-14 shadow-sm"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
										</FormItem>
									)}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
								<FormField
									control={control}
									name="email"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Email Address
											</FormLabel>
											<FormControl>
												<div className="relative group">
													<MailIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
													<Input
														placeholder="pilgrim@example.com"
														className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 text-base px-14 shadow-sm"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="phone"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Phone Number
											</FormLabel>
											<FormControl>
												<div className="relative group">
													<PhoneIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
													<Input
														placeholder="9876543210"
														className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 text-base px-14 shadow-sm"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={control}
								name="aadharNumber"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Aadhar Number (12 Digits)
										</FormLabel>
										<FormControl>
											<div className="relative group">
												<IdCard className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
												<Input
													placeholder="0000 0000 0000"
													maxLength={12}
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 text-base px-14 shadow-sm"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
									</FormItem>
								)}
							/>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-10">
								<FormField
									control={control}
									name="gender"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Gender
											</FormLabel>
											<Select onValueChange={field.onChange} defaultValue={field.value}>
												<FormControl>
													<SelectTrigger className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus:ring-primary/20 text-base px-6 shadow-sm">
														<SelectValue placeholder="Select gender" />
													</SelectTrigger>
												</FormControl>
												<SelectContent className="bg-white border-primary/20 text-foreground">
													<SelectItem value="Male">Male</SelectItem>
													<SelectItem value="Female">Female</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="dateOfBirth"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
												Date of Birth
											</FormLabel>
											<FormControl>
												<div className="relative group">
													<CalendarIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
													<Input
														type="date"
														className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 text-base px-14 shadow-sm"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
										</FormItem>
									)}
								/>
							</div>

							<FormField
								control={control}
								name="password"
								render={({ field }) => (
									<FormItem className="space-y-3">
										<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
											Create Secret Code
										</FormLabel>
										<FormControl>
											<div className="relative group">
												<LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary/60 group-focus-within:text-primary transition-colors" />
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="••••••••"
													className="h-14 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 text-base px-14 shadow-sm"
													{...field}
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-6 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
												>
													{showPassword ? (
														<EyeOffIcon className="h-5 w-5" />
													) : (
														<EyeIcon className="h-5 w-5" />
													)}
												</button>
											</div>
										</FormControl>
										<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full h-20 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.01]"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<Loader2 className="mr-3 h-6 w-6 animate-spin" />
								) : (
									"Complete Registration"
								)}
							</Button>
						</form>
					</Form>

					<div className="mt-10 text-center">
						<p className="text-foreground/30 text-[10px] font-bold uppercase tracking-widest">
							Already a pilgrim?{" "}
							<Link
								to="/login"
								className="text-primary hover:text-foreground transition-colors ml-1 underline underline-offset-4 decoration-primary/30"
							>
								Sign In
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
