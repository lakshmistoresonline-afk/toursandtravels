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
		<div className="bg-transparent min-h-screen">
			<MetaDetails
				metaTitle="AMBADY | Pilgrimage Experiences"
				metaDescription="Faith, Heritage, and Inner Journeys. Curated pilgrimage experiences."
			/>

			{user ? (
				<div className="pt-32 pb-12 bg-transparent relative z-10">
					<div className="container mx-auto px-6 animate-in fade-in slide-in-from-top-4 duration-1000">
						<div className="space-y-2">
							<h1 className="text-5xl md:text-6xl font-serif text-[#fdfcf0]">
								Welcome back, {user.first_name}
							</h1>
							<p className="text-xs text-primary uppercase tracking-[0.4em] font-bold">
								Your spiritual path continues here.
							</p>
						</div>
					</div>
				</div>
			) : (
				<>
					{/* Section 1: Hero for Guests */}
					<HeroSection user={user} />

					{/* Section 2: The AMBADY Way */}
					<section className="py-32 bg-background relative z-10 border-t border-primary/10">
						<div className="container mx-auto px-6">
							<div className="text-center max-w-3xl mx-auto mb-24 space-y-6">
								<h2 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">
									The Ambady Way
								</h2>
								<div className="w-24 h-1 bg-primary mx-auto rounded-full" />
							</div>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-20">
								<div className="text-center space-y-6 group">
									<div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500">
										<h3 className="text-4xl font-serif text-primary">F</h3>
									</div>
									<h3 className="text-2xl font-serif text-foreground">Faith</h3>
									<p className="text-xs text-foreground/60 uppercase tracking-[0.2em] font-medium leading-loose">
										Deeply rooted in spiritual traditions and divine connection.
									</p>
								</div>
								<div className="text-center space-y-6 group">
									<div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500">
										<h3 className="text-4xl font-serif text-primary">H</h3>
									</div>
									<h3 className="text-2xl font-serif text-foreground">Heritage</h3>
									<p className="text-xs text-foreground/60 uppercase tracking-[0.2em] font-medium leading-loose">
										Preserving the sacred stories and architectural wonders of our past.
									</p>
								</div>
								<div className="text-center space-y-6 group">
									<div className="h-20 w-20 rounded-2xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500">
										<h3 className="text-4xl font-serif text-primary">I</h3>
									</div>
									<h3 className="text-2xl font-serif text-foreground">Inner Journeys</h3>
									<p className="text-xs text-foreground/60 uppercase tracking-[0.2em] font-medium leading-loose">
										More than travel—a path to introspection and enlightenment.
									</p>
								</div>
							</div>
						</div>
					</section>
				</>
			)}

			{/* Section: Journeys */}
			<div className="bg-background relative z-10 border-t border-primary/5 py-24">
				<FeaturedToursSection tours={loaderData.featuredToursResp.tours ?? []} />
			</div>
		</div>
	);
}
