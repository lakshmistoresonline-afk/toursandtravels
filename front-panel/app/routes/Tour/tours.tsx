import { toursQuery } from "~/queries/tours.q";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import {
	type LoaderFunctionArgs,
	useLoaderData,
	useSearchParams,
} from "react-router";
import { TourCard } from "~/components/Tour/TourCard";
import { Search, MapPin } from "lucide-react";
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
		<div className="animate-in fade-in duration-700">
			<MetaDetails
				metaTitle="Explore Tours | Ambady Tours and Travels"
				metaDescription="Find your next adventure from our curated list of professional tours."
			/>

			{/* Header Search Section */}
			<div className="bg-slate-50 border-b">
				<div className="container mx-auto px-4 py-16 text-center space-y-6">
					<h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight">Discover Destinations</h1>
					<p className="text-slate-500 max-w-2xl mx-auto text-lg">Browse our verified collection of tours and experiences starting at unbeatable prices.</p>

					<div className="max-w-xl mx-auto">
						<Form method="get" className="relative group">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
							<Input
								name="q"
								placeholder="Where do you want to go?"
								className="h-14 pl-12 rounded-2xl border-2 border-slate-200 focus-visible:border-primary focus-visible:ring-0 transition-all text-lg"
								defaultValue={q}
							/>
						</Form>
					</div>
				</div>
			</div>

			<div className="container mx-auto py-16 px-4">
				{toursResp.tours.length === 0 ? (
					<div className="py-24 text-center space-y-4">
						<div className="bg-slate-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto text-slate-300">
							<MapPin className="h-10 w-10" />
						</div>
						<h2 className="text-2xl font-bold text-slate-900">No matching tours found</h2>
						<p className="text-slate-500">Try searching for something else like "Kerala" or "Goa".</p>
					</div>
				) : (
					<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
						{toursResp.tours.map((tour: any) => (
							<li key={tour.id}>
								<TourCard tour={tour} />
							</li>
						))}
					</ul>
				)}
			</div>
		</div>
	);
}
