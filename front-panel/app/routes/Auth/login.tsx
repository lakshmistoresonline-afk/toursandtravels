import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon } from "lucide-react";
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

const logo = "/brand/ambady-logo.png";

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
		<div className="relative min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-20 px-4 overflow-hidden">
			<div className="relative z-10 w-full max-w-lg animate-in fade-in slide-in-from-bottom-12 duration-1000">
				<MetaDetails metaTitle="Login | AMBADY" />
				<Card className="glass-card border border-[#d4af37]/20 rounded-[3rem] overflow-hidden shadow-2xl shadow-black/50">
					<CardHeader className="text-center pt-12 pb-8 px-10">
						<div className="mx-auto w-24 h-24 mb-6 hover:scale-105 transition-transform duration-500">
							<img src={logo} alt="Ambady Logo" className="w-full h-full object-contain drop-shadow-[0_0_15px_rgba(212,175,55,0.3)]" />
						</div>
						<h2 className="text-4xl font-serif text-[#fdfcf0] tracking-tight mb-2 uppercase">Welcome Back</h2>
						<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.4em]">
							Your Sacred Journey Awaits
						</p>
					</CardHeader>
					<CardContent className="px-12 pb-16">
						<Form {...form}>
							<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-8">
								<FormField
									control={control}
									name="email"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Email Address</FormLabel>
											<FormControl>
												<div className="relative">
													<MailIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#d4af37]/40" />
													<Input
														placeholder="name@pilgrimage.com"
														className="h-16 pl-16 rounded-2xl border border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] placeholder:text-[#fdfcf0]/20 font-sans"
														{...field}
													/>
												</div>
											</FormControl>
											<FormMessage className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-2" />
										</FormItem>
									)}
								/>
								<FormField
									control={control}
									name="password"
									render={({ field }) => (
										<FormItem className="space-y-3">
											<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Secret Code</FormLabel>
											<FormControl>
												<div className="relative">
													<LockIcon className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#d4af37]/40" />
													<Input
														type={showPassword ? "text" : "password"}
														placeholder="••••••••"
														className="h-16 pl-16 pr-16 rounded-2xl border border-white/5 bg-white/5 focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 text-[#fdfcf0] placeholder:text-[#fdfcf0]/20 font-sans"
														{...field}
													/>
													<button
														type="button"
														onClick={() => setShowPassword(!showPassword)}
														className="absolute right-6 top-1/2 -translate-y-1/2 text-[#d4af37]/40 hover:text-[#d4af37] transition-colors"
													>
														{showPassword ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
													</button>
												</div>
											</FormControl>
											<FormMessage className="text-red-400 text-[10px] font-bold uppercase tracking-widest ml-2" />
										</FormItem>
									)}
								/>
								<Button type="submit" className="w-full h-20 rounded-full text-xs font-bold uppercase tracking-[0.3em] bg-[#d4af37] text-[#0a0e1a] shadow-2xl shadow-[#d4af37]/20 hover:scale-[1.02] transition-all hover:bg-[#b8860b]" disabled={isSubmitting}>
									{isSubmitting ? <Loader2 className="mr-3 h-5 w-5 animate-spin" /> : "Sign In to Journey"}
								</Button>
							</form>
						</Form>
						<div className="mt-10 text-center">
							<p className="text-[#fdfcf0]/40 text-[10px] font-bold uppercase tracking-widest">
								New to Ambady?{" "}
								<Link to="/signup" className="text-[#d4af37] hover:text-[#fdfcf0] transition-colors ml-1">
									Begin Registration
								</Link>
							</p>
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
