import type { Route } from "../Home/+types/home";
import { toursQuery } from "~/queries/tours.q";
import FeaturedToursSection from "~/components/Home/FeaturedTours";
import WhyUsSection from "~/components/Home/WhyUsSection";
import HeroSection from "~/components/Home/HeroSection";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { InquiryBanner } from "~/components/Contact/InquirySection";
import { useEffect } from "react";
import { toast } from "sonner";

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
			errors: "",
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
				metaTitle="WanderNest | Simple Tour Management"
				metaDescription="Book amazing tours and enjoy unforgettable travel experiences."
			/>
			<section className="pb-20 sm:space-y-16 space-y-8">
				<HeroSection hero_sections={[]} />
				<FeaturedToursSection tours={loaderData.featuredToursResp.tours ?? []} />
				<WhyUsSection />
				<InquiryBanner />
			</section>
		</>
	);
}
