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
		<div className="min-h-[calc(100vh-80px)] w-full flex items-center justify-center py-16 px-4">
			<div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
				<MetaDetails metaTitle="Forgot Password | AMBADY" metaDescription="Reset your pilgrimage portal access." />

				<div className="text-center space-y-3">
					<div className="mx-auto w-16 h-16 rounded-full border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]">
						<Compass className="h-8 w-8" />
					</div>
					<h2 className="text-3xl font-serif text-[#fdfcf0] tracking-tight uppercase">Reset Password</h2>
					<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.3em]">
						Recover Your Sacred Access
					</p>
				</div>

				<div className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 shadow-xl">
					<Form {...form}>
						<RouterForm method="POST" className="space-y-6">
							<FormField
								control={form.control}
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
							<Button type="submit" className="w-full h-14 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] transition-all shadow-lg shadow-[#d4af37]/10" disabled={isSubmitting}>
								{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Send Reset Link"}
							</Button>
						</RouterForm>
					</Form>
					<div className="mt-8 text-center">
						<Link to="/login" className="text-[#d4af37] hover:text-[#fdfcf0] text-[9px] font-bold uppercase tracking-widest transition-all">
							Back to Sign In
						</Link>
					</div>
				</div>
			</div>
		</div>
	);
}
