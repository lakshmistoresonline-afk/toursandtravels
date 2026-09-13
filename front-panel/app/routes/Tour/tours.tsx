import { toursQuery } from "~/queries/tours.q";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { type LoaderFunctionArgs, useLoaderData } from "react-router";
import { TourCard } from "~/components/Tour/TourCard";
import { Search, Compass } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Form, Link } from "react-router";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") ?? "";
	const toursResp = await toursQuery({ request, q });
	return { toursResp, q };
};

export default function ToursPage() {
	const { toursResp, q } = useLoaderData<typeof clientLoader>();

	return (
		<div className="animate-in fade-in duration-1000 bg-background min-h-screen">
			<MetaDetails
				metaTitle="Pilgrimage Journeys | AMBADY"
				metaDescription="Explore our sacred journeys and spiritual experiences curated for you."
			/>

			{/* Header Search Section */}
			<div className="relative pt-32 pb-24 overflow-hidden bg-[#0a0e1a] border-b border-[#d4af37]/20">
				<div className="container mx-auto px-6 text-center space-y-10 relative z-10">
					<div className="space-y-8">
						<h4 className="text-sm font-bold uppercase tracking-wider text-[#d4af37]">
							Sacred Destinations
						</h4>
						<h1 className="text-6xl md:text-9xl font-serif text-[#fdfcf0] tracking-tight leading-tight">
							Pilgrimage Journeys
						</h1>
						<div className="w-40 h-1 bg-[#d4af37]/30 mx-auto rounded-full shadow-sm" />
					</div>

					<p className="text-[#fdfcf0]/70 max-w-2xl mx-auto text-2xl font-serif italic tracking-wide">
						"Faith | Heritage | Inner Journeys"
					</p>

					<div className="max-w-3xl mx-auto pt-16">
						<Form method="get" className="relative group">
							<Search className="absolute left-8 top-1/2 -translate-y-1/2 h-8 w-8 text-[#d4af37]/60 group-focus-within:text-[#d4af37] transition-colors" />
							<Input
								name="q"
								placeholder="Search your sacred destination..."
								className="h-24 pl-20 pr-10 rounded-full border-2 border-[#d4af37]/20 bg-white/5 backdrop-blur-2xl focus-visible:border-[#d4af37]/60 focus-visible:ring-[#d4af37]/30 transition-all text-2xl text-[#fdfcf0] placeholder:text-[#fdfcf0]/30 shadow-2xl"
								defaultValue={q}
							/>
						</Form>
					</div>
				</div>

				{/* Decorative Background Glow */}
				<div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-full bg-primary/5 blur-[120px] -z-10 rounded-full" />
			</div>

			<div className="container mx-auto py-24 px-6">
				{toursResp.tours.length === 0 ? (
					<div className="py-32 text-center space-y-8 bg-card rounded-[3rem] border border-primary/10 max-w-3xl mx-auto shadow-sm">
						<div className="bg-primary/5 h-24 w-24 rounded-full flex items-center justify-center mx-auto text-primary/40 border border-primary/10">
							<Compass className="h-10 w-10 animate-pulse" />
						</div>
						<div className="space-y-3">
							<h2 className="text-3xl font-serif text-foreground">No Journeys Found</h2>
							<p className="text-foreground/40 font-sans text-xs uppercase tracking-wider font-bold">
								The path you seek is currently unavailable.
							</p>
						</div>
						<div className="pt-4">
							<Link
								to="/tours"
								className="text-[10px] font-bold uppercase tracking-[0.3em] text-primary border-b border-primary/40 pb-1 hover:text-foreground transition-all"
							>
								View All Journeys
							</Link>
						</div>
					</div>
				) : (
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-10 gap-y-16">
						{toursResp.tours.map((tour: any) => (
							<TourCard key={tour.id} tour={tour} />
						))}
					</div>
				)}
			</div>
		</div>
	);
}
