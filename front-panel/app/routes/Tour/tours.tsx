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
			<div className="relative pt-32 pb-24 overflow-hidden bg-[#0a0e1a]">
				<div className="container mx-auto px-6 text-center space-y-8 relative z-10">
					<div className="space-y-4">
						<h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary">
							Sacred Destinations
						</h4>
						<h1 className="text-5xl md:text-7xl font-serif text-[#fdfcf0] tracking-tight leading-tight">
							Pilgrimage Journeys
						</h1>
					</div>

					<p className="text-[#fdfcf0]/60 max-w-2xl mx-auto text-lg font-serif italic tracking-wide">
						"Faith | Heritage | Inner Journeys"
					</p>

					<div className="max-w-2xl mx-auto pt-10">
						<Form method="get" className="relative group">
							<Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60 group-focus-within:text-primary transition-colors" />
							<Input
								name="q"
								placeholder="Search your sacred destination..."
								className="h-16 pl-16 pr-8 rounded-full border border-primary/20 bg-white/5 backdrop-blur-xl focus-visible:border-primary focus-visible:ring-primary/20 transition-all text-lg text-[#fdfcf0] placeholder:text-[#fdfcf0]/30 shadow-2xl"
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
							<p className="text-foreground/40 font-sans text-xs uppercase tracking-[0.2em] font-bold">
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
