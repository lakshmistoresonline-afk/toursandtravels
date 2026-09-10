import { TourCard } from "~/components/Tour/TourCard";
import { Link } from "react-router";
import { ArrowRight } from "lucide-react";

export default function FeaturedToursSection({ tours }: { tours: any[] }) {
	if (!tours || tours.length === 0) return null;

	return (
		<section className="space-y-12 container mx-auto px-4 py-20">
			<div className="flex flex-col md:flex-row justify-between items-end gap-6">
				<div className="space-y-4">
					<h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37]">Recommended</h4>
					<h2 className="text-4xl md:text-5xl font-serif text-[#fdfcf0]">Featured Pilgrimage Journeys</h2>
				</div>
				<Link to="/tours" className="group flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#d4af37] hover:text-[#b8860b] transition-colors">
					View All Pilgrimage Journeys
					<ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
				</Link>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
				{tours.slice(0, 4).map((tour) => (
					<TourCard key={tour.id} tour={tour} />
				))}
			</div>
		</section>
	);
}
