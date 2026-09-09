import { toursQuery } from "~/queries/tours.q";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import {
	type LoaderFunctionArgs,
	useLoaderData,
	useSearchParams,
} from "react-router";
import { TourCard } from "~/components/Tour/TourCard";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") ?? "";
	const toursResp = await toursQuery({ request, q });
	return { toursResp };
};

export default function ToursPage() {
	const { toursResp } = useLoaderData<typeof clientLoader>();
	const [searchParams] = useSearchParams();
	const query = searchParams.get("q");

	return (
		<>
			<MetaDetails
				metaTitle="Explore Tours | WanderNest"
				metaDescription="Explore our curated selection of amazing tours."
			/>
			<div className="container mx-auto py-12 px-4">
				<div className="mb-12">
					<h1 className="text-4xl font-bold tracking-tight">Our Tours</h1>
					<p className="text-muted-foreground mt-2 text-lg">
						{query ? `Search results for "${query}"` : "Discover unforgettable experiences."}
					</p>
				</div>

				{toursResp.tours.length === 0 ? (
					<div className="py-20 text-center">
						<p className="text-xl text-muted-foreground">No tours found matching your search.</p>
					</div>
				) : (
					<ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
						{toursResp.tours.map((tour: any) => (
							<li key={tour.id}>
								<TourCard tour={tour} />
							</li>
						))}
					</ul>
				)}
			</div>
		</>
	);
}
