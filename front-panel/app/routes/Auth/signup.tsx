import { EyeIcon, EyeOffIcon, Loader2, LockIcon, MailIcon, UserIcon } from "lucide-react";
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
import { signupSchema, type SignupFormData } from "@workspace/shared/schemas/signup.schema";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export async function clientAction({ request }: ActionFunctionArgs) {
	const formData = await request.formData();
	const firstName = (formData.get("firstName") as string)?.trim();
	const lastName = (formData.get("lastName") as string)?.trim();
	const email = (formData.get("email") as string)?.trim();
	const password = (formData.get("password") as string)?.trim();

	if (!firstName || !lastName || !email || !password) {
		return { error: "Required fields are missing", success: false };
	}

	const authSvc = new AuthService();
	const result = await authSvc.signUpWithPasswordAndProfile({
		firstName,
		lastName,
		email,
		password,
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
	const navigate = useNavigate();
	const [showPassword, setShowPassword] = useState(false);

	const isSubmitting = navigation.state === "submitting";

	const form = useForm<SignupFormData>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			firstName: "",
			lastName: "",
			email: "",
			password: "",
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
		submit(formData, { method: "POST" });
	};

	useEffect(() => {
		if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	return (
		<div className="container max-w-md mx-auto py-20 px-4">
			<MetaDetails metaTitle="Sign Up | Tours & Travels" />
			<div className="text-center mb-8">
				<h1 className="text-3xl font-bold">Create an Account</h1>
				<p className="text-muted-foreground mt-2">Join us to start booking your dream tours.</p>
			</div>

			<Form {...form}>
				<form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
					<div className="grid grid-cols-2 gap-4">
						<FormField
							control={control}
							name="firstName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>First Name</FormLabel>
									<FormControl>
										<div className="relative">
											<UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input placeholder="John" className="pl-10" {...field} />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name="lastName"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Last Name</FormLabel>
									<FormControl>
										<div className="relative">
											<UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input placeholder="Doe" className="pl-10" {...field} />
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<div className="relative">
										<MailIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
										<Input placeholder="john@example.com" className="pl-10" {...field} />
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
										<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
											{showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
										</button>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full h-11" disabled={isSubmitting}>
						{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Sign Up"}
					</Button>
				</form>
			</Form>

			<div className="mt-6 text-center text-sm">
				Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Login</Link>
			</div>
		</div>
	);
}
