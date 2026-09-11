import { Clock8Icon, Loader2, MapPinIcon, PhoneIcon } from "lucide-react";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { CONTACT_NUMBER_1 } from "@workspace/shared/constants/constants";
import { Button } from "~/components/ui/button";
import { type ActionFunctionArgs, useActionData, useNavigation, useSubmit } from "react-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { contactFormData, contactSchema } from "@workspace/shared/schemas/contact.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Textarea } from "~/components/ui/textarea";
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
		return { success: false, error: error.message || "Failed to process request" };
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

						<div className="surface-card p-8 md:p-12 rounded-[2.5rem] shadow-2xl border-[#d4af37]/10">
							<InquiryForm />
						</div>
					</div>
				</div>
			</section>
		</div>
	);
}

const InquiryForm = () => {
	const actionData = useActionData() as any;
	const submit = useSubmit();
	const navigation = useNavigation();

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

	const { handleSubmit, control, reset } = form;

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Your message has been received.");
			reset();
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData, reset]);

	const handleFormSubmittion = (data: contactFormData) => {
		const formData = new FormData();
		formData.append("email", data.email.trim());
		formData.append("full_name", data.full_name.trim());
		formData.append("subject", data.subject.trim());
		formData.append("message", data.message.trim());
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
										<Input placeholder="Your Name" className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] text-base focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 px-6" {...field} />
									</FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name="email"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Email</FormLabel>
									<FormControl>
										<Input placeholder="email@example.com" className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] text-base focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 px-6" {...field} />
									</FormControl>
									<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={control}
						name="subject"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Subject</FormLabel>
								<FormControl>
									<Input placeholder="Inquiry Topic" className="h-14 rounded-xl border-white/10 bg-black/40 text-[#fdfcf0] text-base focus-visible:ring-[#d4af37]/20 focus-visible:border-[#d4af37]/40 px-6" {...field} />
								</FormControl>
								<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="message"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[9px] font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em] ml-2">Message</FormLabel>
								<FormControl>
									<Textarea placeholder="Share your thoughts..." className="min-h-[160px] p-8 rounded-[2rem] border-white/10 bg-black/40 text-[#fdfcf0] text-sm resize-none focus:ring-[#d4af37]/20 focus:border-[#d4af37]/40 leading-relaxed" {...field} />
								</FormControl>
								<FormMessage className="text-red-400 text-[8px] font-bold uppercase tracking-widest ml-2" />
							</FormItem>
						)}
					/>

					<Button type="submit" className="w-full h-16 rounded-full text-[10px] font-bold uppercase tracking-[0.3em] bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] transition-all shadow-xl shadow-[#d4af37]/20" disabled={isSending}>
						{isSending ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : null}
						Send Inquiry Now
					</Button>
				</form>
			</Form>
		</div>
	);
};
