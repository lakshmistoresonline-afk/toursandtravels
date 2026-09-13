import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, Compass } from "lucide-react";
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
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { AuthService } from "@workspace/shared/services/auth.service";
import { mapAuthError } from "@workspace/shared/utils/auth-helper";
import {
	type emailPasswordLoginFormData,
	emailPasswordLoginSchema,
} from "@workspace/shared/schemas/login.schema";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export async function clientAction({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const email = (formData.get("email") as string)?.trim();
	const password = (formData.get("password") as string)?.trim();

	if (!email || !password) {
		return { error: "Email and password are required", success: false };
	}

	const authSvc = new AuthService();
	const { profile, error } = await authSvc.loginWithPassword({ email, password });

	if (error) {
		return { error: mapAuthError(error.message), success: false };
	}

	// Redirect based on role
	if (profile?.role === "admin") {
		return redirect("/admin");
	}

	return redirect("/");
}

export async function clientLoader({ request }: LoaderFunctionArgs) {
	const { user } = await getCurrentUser(request);
	if (user) {
		return user.role === "admin" ? redirect("/admin") : redirect("/");
	}
	return { user: null };
}

export default function LoginPage() {
	const actionData = useActionData() as any;
	const navigation = useNavigation();
	const [showPassword, setShowPassword] = useState(false);

	const isSubmitting = navigation.state === "submitting";

	const form = useForm<emailPasswordLoginFormData>({
		resolver: zodResolver(emailPasswordLoginSchema),
		defaultValues: { email: "", password: "" },
	});

	const { handleSubmit, control } = form;
	const submit = useSubmit();

	const onFormSubmit = (data: emailPasswordLoginFormData) => {
		const formData = new FormData();
		formData.append("email", data.email.trim());
		formData.append("password", data.password.trim());
		submit(formData, { method: "POST" });
	};

	useEffect(() => {
		if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	return (
		<div className="min-h-[80vh] w-full flex items-center justify-center py-20 px-6 bg-background relative">
			<div className="absolute top-8 left-8">
				<BackButton fallbackUrl="/" label="Home Sanctuary" />
			</div>
			<div className="w-full max-w-md space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
				<MetaDetails
					metaTitle="Login | AMBADY"
					metaDescription="Access your sacred journey portal."
				/>

				<div className="text-center space-y-4">
					<Link to="/" className="inline-flex items-center gap-3 group">
						<div className="w-16 h-16 rounded-full bg-primary/5 border border-primary/20 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform duration-500 shadow-sm">
							<Compass className="h-8 w-8" />
						</div>
					</Link>
					<div className="space-y-2">
						<h2 className="text-4xl font-serif text-foreground tracking-tight">Welcome Back</h2>
						<p className="text-[11px] font-bold text-primary uppercase tracking-[0.4em]">
							Your Sacred Journey Awaits
						</p>
					</div>
				</div>

				<div className="bg-card p-12 md:p-16 rounded-[3.5rem] shadow-2xl border border-primary/10">
					<Form {...form}>
						<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-10">
							<FormField
								control={control}
								name="email"
								render={({ field }) => (
									<FormItem className="space-y-4">
										<FormLabel className="text-[12px] font-bold text-foreground/50 uppercase tracking-[0.2em] ml-3">
											Email Address
										</FormLabel>
										<FormControl>
											<div className="relative group">
												<MailIcon className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60 group-focus-within:text-primary transition-colors" />
												<Input
													placeholder="name@pilgrimage.com"
													className="h-16 pl-16 rounded-2xl border-primary/30 bg-white text-foreground focus-visible:ring-primary/30 text-lg shadow-sm font-medium"
													{...field}
												/>
											</div>
										</FormControl>
										<FormMessage className="text-red-600 text-xs font-bold uppercase tracking-widest ml-4" />
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="password"
								render={({ field }) => (
									<FormItem className="space-y-4">
										<div className="flex justify-between items-center px-3">
											<FormLabel className="text-[12px] font-bold text-foreground/50 uppercase tracking-[0.2em]">
												Secret Code
											</FormLabel>
											<Link
												to="/forgot-password"
												title="Forgot Password"
												className="text-xs font-bold text-primary hover:text-foreground uppercase tracking-[0.1em] transition-all underline underline-offset-4"
											>
												Forgot?
											</Link>
										</div>
										<FormControl>
											<div className="relative group">
												<LockIcon className="absolute left-7 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60 group-focus-within:text-primary transition-colors" />
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="••••••••"
													className="h-16 pl-16 pr-16 rounded-2xl border-primary/30 bg-white text-foreground focus-visible:ring-primary/30 text-lg shadow-sm font-medium"
													{...field}
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-7 top-1/2 -translate-y-1/2 text-primary/40 hover:text-primary transition-colors"
												>
													{showPassword ? (
														<EyeOffIcon className="h-6 w-6" />
													) : (
														<EyeIcon className="h-6 w-6" />
													)}
												</button>
											</div>
										</FormControl>
										<FormMessage className="text-red-600 text-xs font-bold uppercase tracking-widest ml-4" />
									</FormItem>
								)}
							/>
							<Button
								type="submit"
								className="w-full h-20 rounded-full text-sm font-bold uppercase tracking-[0.4em] bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-2xl shadow-primary/30 hover:scale-[1.03]"
								disabled={isSubmitting}
							>
								{isSubmitting ? (
									<Loader2 className="mr-4 h-6 w-6 animate-spin" />
								) : (
									"Sign In to Journey"
								)}
							</Button>
						</form>
					</Form>
					<div className="mt-12 text-center">
						<p className="text-foreground/40 text-xs font-bold uppercase tracking-widest leading-loose">
							New to Ambady?{" "}
							<Link
								to="/signup"
								className="text-primary hover:text-foreground transition-colors ml-1 underline underline-offset-8 decoration-primary/40"
							>
								Begin Registration
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
