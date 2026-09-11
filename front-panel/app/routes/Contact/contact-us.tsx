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
		description: "802 AMBADY Rd, Dubai\n96812, UAE",
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
		<div className="min-h-screen animate-in fade-in duration-700">
			<MetaDetails
				metaTitle="Contact | AMBADY"
				metaDescription="Get in touch with AMBADY PILGRIMAGE EXPERIENCES for inquiries about our pilgrimage journeys and services."
			/>

			<section className="pt-32 pb-20">
				<div className="container mx-auto px-6 max-w-4xl space-y-16">
					<div className="text-center space-y-3">
						<h1 className="text-4xl md:text-5xl font-serif text-[#fdfcf0]">Seek Guidance</h1>
						<p className="text-[#fdfcf0]/40 text-[10px] font-bold uppercase tracking-[0.3em] font-sans">
							Our team is here to support your spiritual quest.
						</p>
					</div>

					<div className="grid gap-12 lg:grid-cols-[1fr_1.5fr]">
						<div className="space-y-8 py-4">
							{contactInfo.map((info, index) => (
								<div key={index} className="space-y-1">
									<h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">{info.title}</h4>
									<div className="text-[#fdfcf0]/60 text-sm font-sans font-light leading-relaxed whitespace-pre-wrap">
										{info.description}
									</div>
								</div>
							))}
						</div>

						<div className="bg-white/5 border border-white/10 p-8 rounded-3xl">
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
				toast.success("Your message has been received.");
				setRecaptchaToken(null);
				reset();
				if (recaptchaRef.current !== null) {
					// @ts-ignore
					recaptchaRef.current.reset();
				}
			} else if (actionData.error) {
				toast.error(actionData.error);
				setRecaptchaToken(null);
			}
		}
	}, [actionData, reset, setError]);

	const handleFormSubmittion = (data: contactFormData) => {
		if (!recaptchaToken) {
			toast.error("Captcha Verification Needed");
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
		<div className="space-y-8">
			<Form {...form}>
				<form method="POST" className="space-y-6" onSubmit={handleSubmit(handleFormSubmittion)}>
					<div className="grid sm:grid-cols-2 gap-6">
						<FormField
							control={control}
							name="full_name"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">Full Name</FormLabel>
									<FormControl>
										<Input placeholder="Your Name" className="h-12 rounded-xl border-white/5 bg-white/5 text-[#fdfcf0] text-sm" {...field} />
									</FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-1" />
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name="email"
							render={({ field }) => (
								<FormItem className="space-y-2">
									<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">Email</FormLabel>
									<FormControl>
										<Input placeholder="email@example.com" className="h-12 rounded-xl border-white/5 bg-white/5 text-[#fdfcf0] text-sm" {...field} />
									</FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-1" />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={control}
						name="subject"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">Subject</FormLabel>
								<FormControl>
									<Input placeholder="Inquiry Topic" className="h-12 rounded-xl border-white/5 bg-white/5 text-[#fdfcf0] text-sm" {...field} />
								</FormControl>
								<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-1" />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="message"
						render={({ field }) => (
							<FormItem className="space-y-2">
								<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] ml-1">Message</FormLabel>
								<FormControl>
									<Textarea placeholder="Share your thoughts..." className="min-h-[120px] p-5 rounded-2xl border-white/5 bg-white/5 text-[#fdfcf0] text-xs resize-none" {...field} />
								</FormControl>
								<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-1" />
							</FormItem>
						)}
					/>

					<GoogleReCaptcha
						siteKey={process.env.VITE_RECAPTCHA_SITE_KEY as string}
						onChange={(token) => setRecaptchaToken(token)}
						ref={recaptchaRef}
					/>

					<Button type="submit" className="w-full h-14 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] transition-all" disabled={isSending || !recaptchaToken}>
						{isSending ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : null}
						Send Inquiry
					</Button>
				</form>
			</Form>
		</div>
	);
};
