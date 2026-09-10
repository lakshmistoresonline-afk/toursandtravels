import { TourCard } from "~/components/Tour/TourCard";
import { Link } from "react-router";
import { ArrowRight, Compass } from "lucide-react";
import { Button } from "~/components/ui/button";

export default function FeaturedToursSection({ tours }: { tours: any[] }) {
	return (
		<section className="space-y-12 container mx-auto px-4 py-24 min-h-[400px] flex flex-col justify-center">
			{tours && tours.length > 0 ? (
				<>
					<div className="flex flex-col md:flex-row justify-between items-end gap-6">
						<div className="space-y-4">
							<h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37]">Recommended</h4>
							<h2 className="text-4xl md:text-5xl font-serif text-[#fdfcf0]">Featured Pilgrimage Journeys</h2>
						</div>
						<Link to="/tours" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:text-[#fdfcf0] transition-colors">
							View All Pilgrimage Journeys
							<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
						</Link>
					</div>

					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{tours.slice(0, 4).map((tour) => (
							<TourCard key={tour.id} tour={tour} />
						))}
					</div>
				</>
			) : (
				<div className="text-center space-y-8 animate-in fade-in duration-1000">
					<div className="mx-auto w-20 h-20 rounded-full glass-card border border-[#d4af37]/20 flex items-center justify-center text-[#d4af37]/30">
						<Compass className="h-10 w-10" />
					</div>
					<div className="space-y-3">
						<h3 className="text-3xl font-serif text-[#fdfcf0]">Sacred Journeys Await</h3>
						<p className="text-[#fdfcf0]/40 font-sans font-light uppercase tracking-[0.2em] text-sm">
							New pilgrimage journeys will be announced soon.
						</p>
					</div>
					<Button variant="outline" className="rounded-full border-[#d4af37]/40 text-[#fdfcf0] hover:bg-[#d4af37]/10 px-10 h-14 text-[10px] font-bold uppercase tracking-widest" asChild>
						<Link to="/contact-us">Inquire About Custom Journeys</Link>
					</Button>
				</div>
			)}
		</section>
	);
}
