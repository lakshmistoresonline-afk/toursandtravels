import { toursQuery } from "~/queries/tours.q";
import FeaturedToursSection from "~/components/Home/FeaturedTours";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { useEffect } from "react";
import { toast } from "sonner";
import { useLoaderData, useRouteLoaderData, Link } from "react-router";
import { clientLoader as rootLoader } from "~/root";
import { Button } from "~/components/ui/button";

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
		<div className="bg-background min-h-screen flex flex-col">
			<MetaDetails
				metaTitle="AMBADY | Pilgrimage Experiences"
				metaDescription="Faith, Heritage, and Inner Journeys. Curated pilgrimage experiences."
			/>

			{/* Phase 1: Background Visual Only Section - DEDICATED AREA */}
			<section className="ambady-home-hero flex-shrink-0 relative overflow-hidden">
				{/* No HTML content over artwork per NON-NEGOTIABLE RULE */}
			</section>

			{/* Phase 2: Home HTML Content - STARTS AFTER IMAGE */}
			<div className="flex-1 bg-background">
				{user && (
					<div className="pt-24 pb-12 bg-background relative z-10 border-b border-primary/5">
						<div className="container mx-auto px-6 animate-in fade-in slide-in-from-top-4 duration-1000">
							<div className="space-y-2">
								<h1 className="text-5xl md:text-6xl font-serif text-foreground">
									Welcome back, {user.first_name}
								</h1>
								<p className="text-xs text-primary uppercase tracking-wider font-bold">
									Your spiritual path continues here.
								</p>
								<p className="text-sm text-primary uppercase tracking-wider font-bold">
									Discover our curated pilgrimage journeys
								</p>
							</div>
						</div>
					</div>
				)}

				{!user && (
					<section className="py-32 bg-background border-b border-primary/10">
						<div className="container mx-auto px-6 text-center space-y-12">
							<div className="space-y-8 max-w-3xl mx-auto">
								<h4 className="text-sm font-bold uppercase tracking-wider text-primary">
									The AMBADY Way
								</h4>
								<h2 className="text-5xl md:text-7xl font-serif text-foreground tracking-tight leading-tight">
									Sacred Paths & Meaningful Journeys
								</h2>
								<p className="text-foreground/80 text-2xl font-serif italic">
									"Faith | Heritage | Inner Journeys"
								</p>
							</div>
							<div className="flex flex-col sm:flex-row items-center justify-center gap-8 pt-8">
								<Button
									size="lg"
									className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-14 h-20 text-sm font-bold uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-105"
									asChild
								>
									<Link to="/tours">Explore Pilgrimage Journeys</Link>
								</Button>
								<Button
									variant="outline"
									size="lg"
									className="rounded-full border-primary/40 text-foreground hover:bg-primary/5 px-14 h-20 text-sm font-bold uppercase tracking-widest transition-all"
									asChild
								>
									<Link to="/about">Learn About AMBADY</Link>
								</Button>
							</div>
						</div>
					</section>
				)}

				{/* Section: Feature Columns */}
				<section className="py-32 bg-background relative z-10 border-b border-primary/5">
					<div className="container mx-auto px-6">
						<div className="grid grid-cols-1 md:grid-cols-3 gap-24">
							<div className="text-center space-y-8 group">
								<div className="h-24 w-24 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500 shadow-sm">
									<h3 className="text-5xl font-serif text-primary">F</h3>
								</div>
								<h3 className="text-3xl font-serif text-foreground">Faith</h3>
								<p className="text-base text-foreground/70 uppercase tracking-wider font-bold leading-loose">
									Deeply rooted in spiritual traditions and divine connection.
								</p>
							</div>
							<div className="text-center space-y-8 group">
								<div className="h-24 w-24 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500 shadow-sm">
									<h3 className="text-5xl font-serif text-primary">H</h3>
								</div>
								<h3 className="text-3xl font-serif text-foreground">Heritage</h3>
								<p className="text-base text-foreground/70 uppercase tracking-wider font-bold leading-loose">
									Preserving the sacred stories and architectural wonders of our past.
								</p>
							</div>
							<div className="text-center space-y-8 group">
								<div className="h-24 w-24 rounded-3xl bg-primary/5 border border-primary/20 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 duration-500 shadow-sm">
									<h3 className="text-5xl font-serif text-primary">I</h3>
								</div>
								<h3 className="text-3xl font-serif text-foreground">Inner Journeys</h3>
								<p className="text-base text-foreground/70 uppercase tracking-wider font-bold leading-loose">
									More than travel—a path to introspection and enlightenment.
								</p>
							</div>
						</div>
					</div>
				</section>

				{/* Section: Journeys List */}
				<div className="bg-background relative z-10 py-24">
					<FeaturedToursSection tours={loaderData.featuredToursResp.tours ?? []} />
				</div>
			</div>
		</div>
	);
}
