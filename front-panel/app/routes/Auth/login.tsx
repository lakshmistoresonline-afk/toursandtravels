import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, Compass } from "lucide-react";
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
import {
	type emailPasswordLoginFormData,
	emailPasswordLoginSchema,
} from "@workspace/shared/schemas/login.schema";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Card, CardContent, CardHeader } from "~/components/ui/card";
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
		return { error: error.message, success: false };
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
		<div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-16 px-4">
			<div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
				<MetaDetails metaTitle="Login | AMBADY" metaDescription="Access your sacred journey portal." />

				<div className="text-center space-y-3">
					<div className="mx-auto w-16 h-16 rounded-full border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
						<Compass className="h-8 w-8" />
					</div>
					<h2 className="text-3xl font-serif text-[#fdfcf0] tracking-tight uppercase">Welcome Back</h2>
					<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em]">
						Your Sacred Journey Awaits
					</p>
				</div>

				<div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl">
					<Form {...form}>
						<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
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
													placeholder="name@pilgrimage.com"
													className="h-12 pl-12 rounded-xl border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] placeholder:text-[#fdfcf0]/20 text-sm"
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
										<div className="flex justify-between items-center px-1">
											<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em]">Secret Code</FormLabel>
											<Link to="/forgot-password" size="sm" className="text-[9px] font-bold text-[#d4af37]/60 hover:text-[#d4af37] uppercase tracking-widest transition-all">Forgot?</Link>
										</div>
										<FormControl>
											<div className="relative">
												<LockIcon className="absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]/40" />
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="••••••••"
													className="h-12 pl-12 pr-12 rounded-xl border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] placeholder:text-[#fdfcf0]/20 text-sm"
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
								{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign In to Journey"}
							</Button>
						</form>
					</Form>
					<div className="mt-8 text-center">
						<p className="text-[#fdfcf0]/30 text-[9px] font-bold uppercase tracking-widest">
							New to Ambady?{" "}
							<Link to="/signup" className="text-[#d4af37] hover:text-[#fdfcf0] transition-colors ml-1">
								Begin Registration
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
