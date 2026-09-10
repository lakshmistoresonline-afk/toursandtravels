import { toursQuery } from "~/queries/tours.q";
import FeaturedToursSection from "~/components/Home/FeaturedTours";
import HeroSection from "~/components/Home/HeroSection";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { useEffect } from "react";
import { toast } from "sonner";
import { Link, useLoaderData } from "react-router";
import { Button } from "~/components/ui/button";
import { Heart, Shield, Sparkles } from "lucide-react";

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
				metaTitle="AMBADY | Pilgrimage Experiences"
				metaDescription="Discover meaningful pilgrimage journeys rooted in faith, heritage and inner journeys."
			/>

			<div className="space-y-0 pb-20">
				{/* Hero Section - Official Background Artwork remains visible */}
				<HeroSection hero_sections={[]} />

				{/* Featured Pilgrimage Journeys - Live Firestore Data */}
				<div className="bg-black/20 backdrop-blur-[2px]">
					<FeaturedToursSection tours={loaderData.featuredToursResp.tours ?? []} />
				</div>

				{/* Why AMBADY - Elegant Brand Explanation */}
				<section className="py-24 container mx-auto px-4">
					<div className="glass-card rounded-[3rem] p-12 md:p-20 border border-[#d4af37]/10">
						<div className="max-w-4xl mx-auto space-y-16">
							<div className="text-center space-y-4">
								<h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37]">Philosophy</h4>
								<h2 className="text-4xl md:text-5xl font-serif text-[#fdfcf0]">The Ambady Way</h2>
								<p className="text-[#fdfcf0]/60 font-sans font-light leading-relaxed max-w-2xl mx-auto uppercase tracking-widest text-sm">
									We curate more than trips; we facilitate spiritual awakenings.
								</p>
							</div>

							<div className="grid md:grid-cols-3 gap-12">
								<div className="space-y-4 text-center group">
									<div className="mx-auto w-16 h-16 rounded-full glass-card border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#0a0e1a] transition-all duration-500">
										<Heart className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-serif text-[#fdfcf0]">Faith</h3>
									<p className="text-sm text-[#fdfcf0]/40 font-sans font-light leading-relaxed">
										Rooted in devotion, our journeys honor the sacred traditions of every destination.
									</p>
								</div>
								<div className="space-y-4 text-center group">
									<div className="mx-auto w-16 h-16 rounded-full glass-card border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#0a0e1a] transition-all duration-500">
										<Shield className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-serif text-[#fdfcf0]">Heritage</h3>
									<p className="text-sm text-[#fdfcf0]/40 font-sans font-light leading-relaxed">
										Preserving and celebrating the cultural legacy of our shared spiritual history.
									</p>
								</div>
								<div className="space-y-4 text-center group">
									<div className="mx-auto w-16 h-16 rounded-full glass-card border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37] group-hover:bg-[#d4af37] group-hover:text-[#0a0e1a] transition-all duration-500">
										<Sparkles className="w-6 h-6" />
									</div>
									<h3 className="text-xl font-serif text-[#fdfcf0]">Inner Journeys</h3>
									<p className="text-sm text-[#fdfcf0]/40 font-sans font-light leading-relaxed">
										A path to wellbeing, seeking the divine within through silence and reflection.
									</p>
								</div>
							</div>
						</div>
					</div>
				</section>

				{/* Call to Action - Contact Us for Guidance */}
				<section className="py-24 text-center space-y-10">
					<div className="space-y-4">
						<h2 className="text-4xl md:text-6xl font-serif text-[#fdfcf0]">Seek Guidance</h2>
						<p className="text-[#fdfcf0]/50 font-sans font-light uppercase tracking-[0.3em] text-sm">
							Our team is here to support your spiritual quest.
						</p>
					</div>
					<Button size="xl" variant="outline" className="rounded-full border-[#d4af37]/40 text-[#fdfcf0] hover:bg-[#d4af37]/10 px-16 py-8 text-sm font-bold uppercase tracking-widest shadow-2xl transition-all" asChild>
						<Link to="/contact-us">Contact Us</Link>
					</Button>
				</section>
			</div>
		</div>
	);
}
