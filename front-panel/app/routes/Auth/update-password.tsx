import { useState, useEffect } from "react";
import { EyeIcon, EyeOffIcon, Loader2, LockIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router";
import { confirmPasswordReset } from "firebase/auth";
import { auth } from "@workspace/shared/lib/firebase";
import { MetaDetails } from "~/components/SEO/MetaDetails";

const updatePasswordSchema = z.object({
	password: z.string().min(8, "Minimum 8 characters"),
	confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
	message: "Passwords don't match",
	path: ["confirmPassword"]
});

export default function UpdatePassword() {
	const navigate = useNavigate();
	const [searchParams] = useSearchParams();
	const [showPassword, setShowPassword] = useState(false);
	const oobCode = searchParams.get("oobCode");

	const form = useForm<z.infer<typeof updatePasswordSchema>>({
		resolver: zodResolver(updatePasswordSchema),
		defaultValues: { password: "", confirmPassword: "" },
	});

	const onSubmit = async (values: any) => {
		if (!oobCode) {
			toast.error("Invalid reset link.");
			return;
		}
		try {
			await confirmPasswordReset(auth, oobCode, values.password);
			toast.success("Password updated successfully!");
			navigate("/login");
		} catch (err: any) {
			toast.error(err.message);
		}
	};

	if (!oobCode) return <div className="text-center py-20">Invalid reset link.</div>;

	return (
		<div className="container max-w-md mx-auto py-20 px-4">
			<MetaDetails metaTitle="Update Password | AMADY PILGRIMAGE EXPERIENCES" />
			<Card>
				<CardHeader><CardTitle className="text-2xl">Set New Password</CardTitle></CardHeader>
				<CardContent>
					<Form {...form}>
						<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
							<FormField control={form.control} name="password" render={({ field }) => (
								<FormItem>
									<FormLabel>New Password</FormLabel>
									<FormControl>
										<div className="relative">
											<LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
											<Input type={showPassword ? "text" : "password"} className="pl-10" {...field} />
											<button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2">
												{showPassword ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
											</button>
										</div>
									</FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<FormField control={form.control} name="confirmPassword" render={({ field }) => (
								<FormItem>
									<FormLabel>Confirm Password</FormLabel>
									<FormControl><Input type="password" {...field} /></FormControl>
									<FormMessage />
								</FormItem>
							)} />
							<Button type="submit" className="w-full h-11" disabled={form.formState.isSubmitting}>
								{form.formState.isSubmitting ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : "Update Password"}
							</Button>
						</form>
					</Form>
				</CardContent>
			</Card>
		</div>
	);
}
