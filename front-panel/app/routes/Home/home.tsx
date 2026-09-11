import { toursQuery } from "~/queries/tours.q";
import FeaturedToursSection from "~/components/Home/FeaturedTours";
import HeroSection from "~/components/Home/HeroSection";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLoaderData, useRouteLoaderData } from "react-router";
import { clientLoader as rootLoader } from "~/root";

export const clientLoader = async ({ request }: any) => {
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

export default function Home() {
	const loaderData = useLoaderData() as any;
	const rootData = useRouteLoaderData<typeof rootLoader>("root");
	const user = rootData?.user;

	useEffect(() => {
		if (loaderData.errors) {
			toast.error(loaderData.errors);
		}
		if (loaderData.success_msg) {
			toast.success(loaderData.success_msg);
		}
	}, [loaderData]);

	return (
		<div className="bg-[#0a0e1a] min-h-screen">
			<MetaDetails
				metaTitle="AMBADY | Sacred Journeys"
				metaDescription="Curated pilgrimage experiences."
			/>

			{user ? (
				<div className="pt-32 pb-6 container mx-auto px-4 animate-in fade-in slide-in-from-top-4 duration-1000">
					<div className="space-y-1">
						<h1 className="text-4xl font-serif text-[#fdfcf0]">Welcome back, {user.first_name}</h1>
						<p className="text-[10px] text-[#d4af37] uppercase tracking-[0.3em] font-bold">Your spiritual path continues here.</p>
					</div>
				</div>
			) : (
				/* Section 1: Hero for Guests */
				<HeroSection hero_sections={[]} user={user} />
			)}

			{/* Section 2: Journeys */}
			<div className={user ? "pb-20" : ""}>
				<FeaturedToursSection tours={loaderData.featuredToursResp.tours ?? []} />
			</div>
		</div>
	);
}
