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
		<div className="min-h-screen bg-background animate-in fade-in duration-700">
			<MetaDetails
				metaTitle="Contact | AMBADY"
				metaDescription="Get in touch with AMBADY PILGRIMAGE EXPERIENCES for inquiries about our pilgrimage journeys and services."
			/>

			<section className="pt-32 pb-24">
				<div className="container mx-auto px-6 max-w-5xl space-y-20">
					<div className="text-center space-y-4">
						<h1 className="text-5xl md:text-6xl font-serif text-foreground leading-tight">
							Seek Guidance
						</h1>
						<div className="w-20 h-1 bg-primary mx-auto rounded-full" />
						<p className="text-foreground/40 text-[11px] font-bold uppercase tracking-[0.4em] font-sans">
							Our team is here to support your spiritual quest.
						</p>
					</div>

					<div className="grid gap-16 lg:grid-cols-[1fr_1.8fr] items-start">
						<div className="space-y-12 py-6">
							{contactInfo.map((info, index) => (
								<div key={index} className="flex gap-6 items-start group">
									<div className="h-12 w-12 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground shrink-0">
										<info.icon className="h-6 w-6" />
									</div>
									<div className="space-y-2 pt-1">
										<h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary">
											{info.title}
										</h4>
										<div className="text-foreground/60 text-base font-sans leading-relaxed whitespace-pre-wrap">
											{info.description}
										</div>
									</div>
								</div>
							))}
						</div>

						<div className="bg-card p-10 md:p-16 rounded-[3rem] shadow-xl border border-primary/10">
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
				<form method="POST" className="space-y-8" onSubmit={handleSubmit(handleFormSubmittion)}>
					<div className="grid sm:grid-cols-2 gap-8">
						<FormField
							control={control}
							name="full_name"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
										Full Name
									</FormLabel>
									<FormControl>
										<Input
											placeholder="Your Name"
											className="h-14 rounded-2xl border-primary/20 bg-white text-foreground text-base focus-visible:ring-primary/20 px-6 shadow-sm"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
								</FormItem>
							)}
						/>
						<FormField
							control={control}
							name="email"
							render={({ field }) => (
								<FormItem className="space-y-3">
									<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
										Email
									</FormLabel>
									<FormControl>
										<Input
											placeholder="email@example.com"
											className="h-14 rounded-2xl border-primary/20 bg-white text-foreground text-base focus-visible:ring-primary/20 px-6 shadow-sm"
											{...field}
										/>
									</FormControl>
									<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={control}
						name="subject"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
									Subject
								</FormLabel>
								<FormControl>
									<Input
										placeholder="Inquiry Topic"
										className="h-14 rounded-2xl border-primary/20 bg-white text-foreground text-base focus-visible:ring-primary/20 px-6 shadow-sm"
										{...field}
									/>
								</FormControl>
								<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
							</FormItem>
						)}
					/>
					<FormField
						control={control}
						name="message"
						render={({ field }) => (
							<FormItem className="space-y-3">
								<FormLabel className="text-[10px] font-bold text-foreground/40 uppercase tracking-[0.2em] ml-2">
									Message
								</FormLabel>
								<FormControl>
									<Textarea
										placeholder="Share your thoughts or spiritual needs..."
										className="min-h-[180px] p-8 rounded-[2.5rem] border-primary/20 bg-white text-foreground text-base resize-none focus:ring-primary/20 leading-relaxed shadow-sm"
										{...field}
									/>
								</FormControl>
								<FormMessage className="text-red-600 text-[9px] font-bold uppercase tracking-widest ml-3" />
							</FormItem>
						)}
					/>

					<Button
						type="submit"
						className="w-full h-20 rounded-full text-[11px] font-bold uppercase tracking-[0.3em] bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02]"
						disabled={isSending}
					>
						{isSending ? <Loader2 className="animate-spin mr-3 h-6 w-6" /> : null}
						Send Inquiry Now
					</Button>
				</form>
			</Form>
		</div>
	);
};
