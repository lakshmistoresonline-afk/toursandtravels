import { MailIcon, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { type ActionFunctionArgs, Form as RouterForm, useActionData, useNavigation } from "react-router";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { toast } from "sonner";
import { z } from "zod";
import { AuthService } from "@workspace/shared/services/auth.service";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { useEffect } from "react";

const forgotSchema = z.object({
	email: z.string().email("Please enter a valid email"),
});

export async function clientAction({ request }: ActionFunctionArgs) {
	try {
		const formData = await request.formData();
		const email = formData.get("email") as string;
		const authSvc = new AuthService();
		return await authSvc.sendResetPasswordRequest(email);
	} catch (err: any) {
		return { success: false, error: err.message };
	}
}

export default function ForgotPassword() {
	const actionData = useActionData() as any;
	const navigation = useNavigation();
	const isSubmitting = navigation.state === "submitting";

	const form = useForm<z.infer<typeof forgotSchema>>({
		resolver: zodResolver(forgotSchema),
		defaultValues: { email: "" },
	});

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Password reset email sent!");
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	return (
		<div className="container max-w-md mx-auto py-20 px-4">
			<MetaDetails metaTitle="Forgot Password | Ambady Tours and Travels" />
			<Card>
				<CardHeader className="text-center">
					<CardTitle className="text-2xl">Reset Password</CardTitle>
					<CardDescription>Enter your email to receive a password reset link.</CardDescription>
				</CardHeader>
				<CardContent>
					<Form {...form}>
						<RouterForm method="POST" className="space-y-4">
							<FormField
								control={form.control}
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
							<Button type="submit" className="w-full h-11" disabled={isSubmitting}>
								{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
							</Button>
						</RouterForm>
					</Form>
					<div className="mt-4 text-center text-sm">
						<a href="/login" className="text-primary hover:underline">Back to login</a>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
