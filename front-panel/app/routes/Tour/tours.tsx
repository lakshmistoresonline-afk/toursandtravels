import { toursQuery } from "~/queries/tours.q";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import {
	type LoaderFunctionArgs,
	useLoaderData,
} from "react-router";
import { TourCard } from "~/components/Tour/TourCard";
import { Search, MapPin, Compass } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Form } from "react-router";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") ?? "";
	const toursResp = await toursQuery({ request, q });
	return { toursResp, q };
};

export default function ToursPage() {
	const { toursResp, q } = useLoaderData<typeof clientLoader>();

	return (
		<div className="animate-in fade-in duration-1000">
			<MetaDetails
				metaTitle="Pilgrimage Journeys | AMADY"
				metaDescription="Explore our sacred journeys and spiritual experiences curated for you."
			/>

			{/* Header Search Section */}
			<div className="relative pt-32 pb-20 overflow-hidden">
				<div className="container mx-auto px-4 text-center space-y-8 relative z-10">
					<div className="space-y-4">
						<h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37]">Sacred Destinations</h4>
						<h1 className="text-5xl md:text-7xl font-serif text-[#fdfcf0] tracking-tight">Pilgrimage Journeys</h1>
					</div>

					<p className="text-[#fdfcf0]/60 max-w-2xl mx-auto text-lg font-sans font-light tracking-wide uppercase italic">
						"Faith | Heritage | Inner Journeys"
					</p>

					<div className="max-w-2xl mx-auto pt-8">
						<Form method="get" className="relative group">
							<Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-[#d4af37]/60 group-focus-within:text-[#d4af37] transition-colors" />
							<Input
								name="q"
								placeholder="Search your sacred destination..."
								className="h-16 pl-16 pr-8 rounded-full border border-[#d4af37]/20 bg-[#0a0e1a]/40 backdrop-blur-xl focus-visible:border-[#d4af37] focus-visible:ring-0 transition-all text-lg text-[#fdfcf0] placeholder:text-[#fdfcf0]/30 shadow-2xl shadow-black/20"
								defaultValue={q}
							/>
						</Form>
					</div>
				</div>

				{/* Decorative Background Glow */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-[#d4af37]/5 blur-[120px] -z-10 rounded-full" />
			</div>

			<div className="container mx-auto py-20 px-4">
				{toursResp.tours.length === 0 ? (
					<div className="py-32 text-center space-y-6 glass-card rounded-[3rem] border border-[#d4af37]/10 max-w-3xl mx-auto">
						<div className="bg-[#d4af37]/10 h-24 w-24 rounded-full flex items-center justify-center mx-auto text-[#d4af37]/40 border border-[#d4af37]/20">
							<Compass className="h-10 w-10 animate-pulse" />
						</div>
						<div className="space-y-2">
							<h2 className="text-3xl font-serif text-[#fdfcf0]">No Journeys Found</h2>
							<p className="text-[#fdfcf0]/40 font-sans text-sm uppercase tracking-widest">The path you seek is currently unavailable.</p>
						</div>
						<div className="pt-4">
							<a href="/tours" className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] border-b border-[#d4af37]/40 pb-1 hover:text-[#fdfcf0] transition-colors">View All Journeys</a>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
						{toursResp.tours.map((tour: any) => (
							<TourCard key={tour.id} tour={tour} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
