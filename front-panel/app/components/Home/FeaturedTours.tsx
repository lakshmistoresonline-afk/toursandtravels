import { TourCard } from "~/components/Tour/TourCard";

export default function FeaturedToursSection({ tours }: { tours: any[] }) {
	if (!tours || tours.length === 0) return null;

	return (
		<section className="space-y-6 container mx-auto px-4">
			<div className="flex justify-between items-center">
				<h2 className="text-3xl font-bold tracking-tight">Top Destinations</h2>
			</div>

			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
				{tours.map((tour) => (
					<TourCard key={tour.id} tour={tour} />
				))}
			</div>
		</section>
	);
}
