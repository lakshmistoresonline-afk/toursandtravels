import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	type ActionFunctionArgs,
	Link,
	type LoaderFunctionArgs,
	redirect,
	useActionData,
	useNavigate,
	useNavigation,
	useSubmit,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
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
	const navigate = useNavigate();
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
		<div className="container max-w-md mx-auto py-20">
			<MetaDetails metaTitle="Login | Tours & Travels" />
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Welcome Back</CardTitle>
					<CardDescription>Login to manage your tours or book new ones.</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
							<FormField
								control={control}
								name="email"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Email</FormLabel>
										<FormControl>
											<div className="relative">
												<MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
												<Input placeholder="name@example.com" className="pl-10" {...field} />
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<FormField
								control={control}
								name="password"
								render={({ field }) => (
									<FormItem>
										<FormLabel>Password</FormLabel>
										<FormControl>
											<div className="relative">
												<LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
												<Input
													type={showPassword ? "text" : "password"}
													placeholder="••••••••"
													className="pl-10"
													{...field}
												/>
												<button
													type="button"
													onClick={() => setShowPassword(!showPassword)}
													className="absolute right-3 top-1/2 -translate-y-1/2"
												>
													{showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
												</button>
											</div>
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button type="submit" className="w-full" disabled={isSubmitting}>
								{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Login"}
							</Button>
						</form>
					</Form>
					<div className="mt-4 text-center text-sm">
						Don't have an account? <Link to="/signup" className="text-primary hover:underline">Sign up</Link>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
