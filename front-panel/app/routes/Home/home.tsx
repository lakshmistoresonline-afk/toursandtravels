import type { Route } from "./+types/home";
import { toursQuery } from "~/queries/tours.q";
import FeaturedToursSection from "~/components/Home/FeaturedTours";
import HeroSection from "~/components/Home/HeroSection";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { useEffect } from "react";
import { toast } from "sonner";
import { Card, CardContent } from "~/components/ui/card";

export const clientLoader = async ({ request }: Route.ClientLoaderArgs) => {
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
		<div className="bg-transparent">
			<MetaDetails
				metaTitle="AMADY PILGRIMAGE EXPERIENCES | Premium Pilgrimage Journeys"
				metaDescription="Book curated pilgrimage journeys and unforgettable sacred experiences with ease."
			/>

			<div className="space-y-20 pb-20">
				{/* Hero Section */}
				<HeroSection hero_sections={[]} />

				{/* Featured Tours */}
				<FeaturedToursSection tours={loaderData.featuredToursResp.tours ?? []} />
			</div>
		</div>
	);
}
