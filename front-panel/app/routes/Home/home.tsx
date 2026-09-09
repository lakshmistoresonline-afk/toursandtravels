import type { Route } from "../Home/+types/home";
import { toursQuery } from "~/queries/tours.q";
import FeaturedToursSection from "~/components/Home/FeaturedTours";
import WhyUsSection from "~/components/Home/WhyUsSection";
import HeroSection from "~/components/Home/HeroSection";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { InquiryBanner } from "~/components/Contact/InquirySection";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "~/components/ui/card";
import { ShieldCheck, Star, Headset, IndianRupee } from "lucide-react";

export const clientLoader = async ({ request }: Route.LoaderArgs) => {
	try {
		const featuredToursResp = await toursQuery({ request, q: "" });

		const searchParams = new URL(request.url).searchParams;
		const errors = searchParams.get("error") || "";
		const success_msg = searchParams.get("success") || "";

		return {
			featuredToursResp,
			errors,
			success_msg,
		};
	} catch (error) {
		return {
			featuredToursResp: { tours: [], total: 0 },
			errors: "Failed to load tours. Please check your internet connection.",
			success_msg: "",
		};
	}
};

export default function Home({ loaderData }: Route.ComponentProps) {
	useEffect(() => {
		if (loaderData.errors) {
			toast.error(loaderData.errors);
		}
		if (loaderData.success_msg) {
			toast.success(loaderData.success_msg);
		}
	}, [loaderData]);

	return (
		<>
			<MetaDetails
				metaTitle="Ambady Tours and Travels | Premium Tour Experiences"
				metaDescription="Book curated tours and unforgettable travel experiences with ease."
			/>

			<div className="space-y-20 pb-20">
				{/* Hero Section */}
				<HeroSection hero_sections={[]} />

				{/* Feature Highlights */}
				<section className="container mx-auto px-4">
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
						{[
							{ title: "Trusted Tours", desc: "Hand-vetted experiences for safety and quality.", icon: ShieldCheck, color: "bg-blue-50 text-blue-600" },
							{ title: "Top Rated", desc: "Consistently high scores from our global community.", icon: Star, color: "bg-yellow-50 text-yellow-600" },
							{ title: "24/7 Support", desc: "Our dedicated team is always here for you.", icon: Headset, color: "bg-purple-50 text-purple-600" },
							{ title: "Best Value", desc: "Competitive pricing with no hidden charges.", icon: IndianRupee, color: "bg-green-50 text-green-600" },
						].map((item, i) => (
							<Card key={i} className="border-none shadow-sm bg-white/50 backdrop-blur-sm hover:shadow-md transition-all">
								<CardContent className="pt-6">
									<div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center mb-4`}>
										<item.icon className="w-6 h-6" />
									</div>
									<h3 className="font-bold text-lg mb-1">{item.title}</h3>
									<p className="text-muted-foreground text-sm leading-relaxed">{item.desc}</p>
								</CardContent>
							</Card>
						))}
					</div>
				</section>

				{/* Featured Tours */}
				<FeaturedToursSection tours={loaderData.featuredToursResp.tours ?? []} />

				{/* Brand Story / Why Us Section */}
				<WhyUsSection />

				{/* Contact/Inquiry Section */}
				<InquiryBanner />
			</div>
		</>
	);
}
