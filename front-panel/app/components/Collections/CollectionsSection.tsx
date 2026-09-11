import type { FPCollection } from "@workspace/shared/types/collections";
import { TourCard } from "~/components/Tour/TourCard";
import { Carousel, CarouselContent, CarouselItem } from "~/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import { Link } from "react-router";
import { ArrowRight, Compass } from "lucide-react";

export default function CollectionsSection({
	collections,
	title = "Sacred Collections",
	isCity = false,
}: {
	collections: FPCollection[];
	title?: string;
	isCity?: boolean;
}) {
	if (collections.length === 0) return null;

	return (
		<section className="py-24">
			<div className="container mx-auto space-y-20">
				<div className="text-center space-y-6">
					<h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37]">
						Curated Paths
					</h4>
					<h2 className="text-4xl md:text-6xl font-serif text-[#fdfcf0]">{title}</h2>
					<p className="text-[#fdfcf0]/40 font-sans font-light uppercase tracking-[0.2em] text-xs">
						{!isCity
							? "Handpicked spiritual experiences curated by AMBADY PILGRIMAGE EXPERIENCES"
							: "Explore sacred destinations for your next spiritual journey"}
					</p>
				</div>
				<div className="space-y-24">
					{collections.map((collection) => (
						<CollectionCarousel key={collection.id} collection={collection} />
					))}
				</div>
			</div>
		</section>
	);
}

function CollectionCarousel({ collection, ...props }: { collection: FPCollection }) {
	const tours = collection.tours || [];

	return (
		<div {...props} className="space-y-10">
			{/* Header */}
			<div className="flex justify-between items-end gap-6 px-4">
				<div className="space-y-2">
					<h3 className="text-3xl font-serif text-[#fdfcf0] tracking-tight">{collection.name}</h3>
					{collection.description && (
						<p className="text-sm text-[#fdfcf0]/40 font-sans font-light max-w-2xl">
							{collection.description}
						</p>
					)}
				</div>
				<Link
					to={`/collection/${collection.id}`}
					className="group hidden sm:flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-[#d4af37] border-b border-[#d4af37]/20 pb-1 hover:text-[#fdfcf0] transition-all"
				>
					Explore All
					<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-all" />
				</Link>
			</div>

			<Carousel
				className="w-full"
				opts={{
					align: "start",
					loop: true,
				}}
				plugins={[
					Autoplay({
						delay: 5000,
					}),
				]}
			>
				<CarouselContent className="-ml-6">
					{tours.map((tour) => (
						<CarouselItem key={tour.id} className="pl-6 md:basis-1/2 lg:basis-1/3 xl:basis-1/4">
							<TourCard tour={tour} />
						</CarouselItem>
					))}
				</CarouselContent>
			</Carousel>

			{tours.length === 0 && (
				<div className="py-20 text-center glass-card rounded-[2.5rem] border border-dashed border-white/10 mx-4">
					<Compass className="h-10 w-10 text-white/10 mx-auto mb-4" />
					<p className="text-[#fdfcf0]/30 text-[10px] font-bold uppercase tracking-widest">
						No journeys available in this collection yet.
					</p>
				</div>
			)}
		</div>
	);
}
