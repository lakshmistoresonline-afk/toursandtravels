import { TourCard } from "~/components/Tour/TourCard";

export default function FeaturedToursSection({ tours }: { tours: any[] }) {
	if (!tours || tours.length === 0) return null;

	return (
		<section className="space-y-16 container mx-auto px-6 py-24 animate-in fade-in duration-1000">
			<div className="text-center space-y-4">
				<h2 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">
					Sacred Paths
				</h2>
				<div className="w-20 h-1 bg-primary mx-auto rounded-full" />
				<p className="text-[11px] text-primary uppercase tracking-[0.4em] font-bold">
					Discover our curated pilgrimage journeys
				</p>
			</div>

			<div className="flex justify-center">
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-12 w-full max-w-7xl">
					{tours.slice(0, 8).map((tour) => (
						<TourCard key={tour.id} tour={tour} />
					))}
				</div>
			</div>
		</section>
	);
}
