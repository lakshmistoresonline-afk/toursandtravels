import { Card, CardContent, CardHeader } from "~/components/ui/card";
import { Clock8Icon, Loader2, MapPinIcon, PhoneIcon, Send } from "lucide-react";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { CONTACT_NUMBER_1 } from "@workspace/shared/constants/constants";
import { Button } from "~/components/ui/button";
import { GoogleReCaptcha, verifyRecaptcha } from "~/components/ReCaptcha/GoogleReCaptcha";
import { ActionResponse } from "@workspace/shared/types/action-data";
import { type ActionFunctionArgs, useActionData, useNavigation, useSubmit } from "react-router";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { contactFormData, contactSchema } from "@workspace/shared/schemas/contact.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
import { ApiError } from "@workspace/shared/utils/ApiError";
import { emailService } from "@workspace/shared/services/emails.service";

const contactInfo = [
	{
		title: "Sacred Hours",
		icon: Clock8Icon,
		description: "Mon-Fri: 8:00 AM - 11:00 PM\nSat-Sun: Spiritual Retreat",
	},
	{
		title: "The Sanctuary",
		icon: MapPinIcon,
		description: "802 AMADY Rd, Dubai\n96812, UAE",
	},
	{
		title: "Direct Path",
		icon: PhoneIcon,
		description: "+" + CONTACT_NUMBER_1,
	},
];

export const clientAction = async ({ request }: ActionFunctionArgs) => {
	try {
		const formData = await request.formData();
		const recaptchaToken = formData.get("recaptchaToken") as string;

		if (!recaptchaToken || recaptchaToken == "") {
			return { success: false, error: "Captcha identification failed" };
		}

		const captchaResult = await verifyRecaptcha(recaptchaToken);
		if (!captchaResult.success) {
			return { success: false, error: "Captcha verification failed" };
		}

		const data = {
			full_name: formData.get("full_name") as string,
			email: formData.get("email") as string,
			subject: formData.get("subject") as string,
			message: formData.get("message") as string,
		};

		const parseResult = contactSchema.safeParse(data);
		if (!parseResult.success) {
			const firstError = Object.values(parseResult.error.flatten().fieldErrors).flat()[0]!;
			return { success: false, error: firstError };
		}

		await emailService.sendInquiry(data);
		return { success: true };
	} catch (error: any) {
		const errorMessage = error instanceof ApiError ? error.message : error.message || "Failed to process request";
		return { success: false, error: errorMessage };
	}
};

export const clientLoader = () => {
	return null;
};

export default function ContactUs() {
	return (
		<div className="min-h-screen animate-in fade-in duration-1000">
			<MetaDetails
				metaTitle="Contact | AMADY"
				metaDescription="Get in touch with AMADY PILGRIMAGE EXPERIENCES for inquiries about our pilgrimage journeys and services."
				metaKeywords="AMADY PILGRIMAGE EXPERIENCES, Contact, Faith, Heritage"
			/>

			<section className="pt-32 pb-20">
				<div className="container mx-auto px-6 max-w-7xl">
					<div className="text-center space-y-4 mb-20">
						<h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37]">Communion</h4>
						<h1 className="text-5xl md:text-7xl font-serif text-[#fdfcf0] tracking-tight">Seek Guidance</h1>
						<p className="text-[#fdfcf0]/40 text-sm font-sans font-light uppercase tracking-widest leading-relaxed max-w-2xl mx-auto">
							We are here to support your spiritual quest. Reach out for any inquiries regarding our sacred journeys.
						</p>
					</div>

					<div className="grid gap-16 lg:grid-cols-[0.8fr_1fr]">
						<div className="space-y-12">
							<div className="grid gap-6 sm:grid-cols-1 md:grid-cols-3 lg:grid-cols-1">
								{contactInfo.map((info, index) => (
									<div key={index} className="glass-card p-8 rounded-[2rem] border border-[#d4af37]/10 flex items-start gap-6 group hover:border-[#d4af37]/30 transition-all duration-500">
										<div className="h-12 w-12 rounded-full glass-card border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]/60 group-hover:text-[#d4af37] transition-colors">
											<info.icon className="h-5 w-5" />
										</div>
										<div className="space-y-2">
											<h4 className="text-[10px] font-bold uppercase tracking-[0.3em] text-[#d4af37]">{info.title}</h4>
											<div className="text-[#fdfcf0]/60 text-sm font-sans font-light leading-relaxed whitespace-pre-wrap">
												{info.description}
											</div>
										</div>
									</div>
								))}
							</div>
						</div>

						<div className="glass-card p-10 md:p-12 rounded-[3rem] border border-[#d4af37]/10 shadow-2xl relative overflow-hidden">
							<div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
								<Send className="h-32 w-32 text-[#d4af37] -rotate-12" />
							</div>
							<InquiryForm />
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

const InquiryForm = () => {
	const actionData: ActionResponse = useActionData();
	const submit = useSubmit();
	const navigation = useNavigation();
	const recaptchaRef = useRef(null);
	const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);

	const isSending = navigation.state === "submitting" && navigation.formMethod === "POST";

	const form = useForm<contactFormData>({
		disabled: isSending,
		resolver: zodResolver(contactSchema),
		mode: "onChange",
		defaultValues: {
			email: "",
			full_name: "",
			message: "",
			subject: "",
		},
	});

	const { setError, handleSubmit, control, reset } = form;

	useEffect(() => {
		if (actionData) {
			if (actionData.success) {
				toast.success("Your message has been received. Guidance will follow soon.");
				setRecaptchaToken(null);
				reset();
				if (recaptchaRef.current !== null) {
					// @ts-ignore
					recaptchaRef.current.reset();
				}
			} else if (actionData.error) {
				toast.error(actionData.error);
				setRecaptchaToken(null);
			} else if (actionData.validationErrors) {
				toast.error("Invalid input. Please check your details.");
				Object.entries(actionData.validationErrors).forEach(([field, errors]) => {
					setError(field as keyof contactFormData, { message: errors[0] });
				});
			}
		}
	}, [actionData, reset, setError]);

	const handleFormSubmittion = (data: contactFormData) => {
		if (!recaptchaToken) {
			toast.error("Identity Verification Needed", { description: "Please complete the captcha." });
			return;
		}

		const formData = new FormData();
		formData.append("email", data.email.trim());
		formData.append("full_name", data.full_name.trim());
		formData.append("subject", data.subject.trim());
		formData.append("message", data.message.trim());
		formData.append("recaptchaToken", recaptchaToken);
		submit(formData, { method: "POST", action: "/contact-us" });
	};

	return (
		<div className="space-y-10">
			<div className="space-y-2">
				<h3 className="text-3xl font-serif text-[#fdfcf0] tracking-tight">Divine Inquiry</h3>
				<p className="text-[10px] font-bold text-[#fdfcf0]/30 uppercase tracking-[0.3em]">Send your message to the sanctuary</p>
			</div>

			<Form {...form}>
				<form method="POST" className="space-y-8" onSubmit={handleSubmit(handleFormSubmittion)}>
					<div className="grid sm:grid-cols-2 gap-8">
						<FormField
							control={control}
							name="full_name"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Full Name</FormLabel>
									<FormControl>
										<Input placeholder="Your Name" className="h-16 rounded-2xl border-white/5 bg-white/5 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} />
									</FormControl>
									<FormMessage className="text-red-400 text-[9px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name="email"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Email</FormLabel>
									<FormControl>
										<Input placeholder="email@example.com" className="h-16 rounded-2xl border-white/5 bg-white/5 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} />
									</FormControl>
									<FormMessage className="text-red-400 text-[9px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={control}
						name="subject"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Subject</FormLabel>
								<FormControl>
									<Input placeholder="Inquiry Topic" className="h-16 rounded-2xl border-white/5 bg-white/5 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40" {...field} />
								</FormControl>
								<FormMessage className="text-red-400 text-[9px] font-bold uppercase tracking-widest ml-2" />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="message"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-2">Message</FormLabel>
								<FormControl>
									<Textarea placeholder="Share your thoughts..." className="min-h-[160px] p-6 rounded-2xl border-white/5 bg-white/5 text-[#fdfcf0] focus:ring-[#d4af37]/20 focus:border-[#d4af37]/40 outline-none resize-none" {...field} />
								</FormControl>
								<FormMessage className="text-red-400 text-[9px] font-bold uppercase tracking-widest ml-2" />
							</FormItem>
						)}
					/>

					<GoogleReCaptcha
						siteKey={process.env.VITE_RECAPTCHA_SITE_KEY as string}
						onChange={(token) => setRecaptchaToken(token)}
						ref={recaptchaRef}
					/>

					<Button type="submit" className="w-full h-20 rounded-full text-xs font-bold uppercase tracking-[0.3em] bg-[#d4af37] text-[#0a0e1a] shadow-2xl shadow-[#d4af37]/20 hover:scale-[1.02] transition-all hover:bg-[#b8860b]" disabled={isSending || !recaptchaToken}>
						{isSending ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : <Send className="mr-3 h-4 w-4" />}
						Send Inquiry
					</Button>
				</form>
			</Form>
		</div>
	);
};
