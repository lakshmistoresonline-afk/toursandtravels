import { useLoaderData } from "react-router";
import { tourDetailsQuery } from "~/queries/tours.q";
import { Compass, Calendar, MapPin, Printer } from "lucide-react";
import { format } from "date-fns";

export const clientLoader = async ({ params, request }: any) => {
	const tour = await tourDetailsQuery({ request, tour_id: params.id });
	return { tour };
};

export default function ItineraryPrintPage() {
	const { tour } = useLoaderData<typeof clientLoader>();

	if (!tour) return <div className="p-20 text-center">Journey not found</div>;

	return (
		<div className="min-h-screen bg-white p-12 text-[#0a0e1a]">
			{/* Print Controls */}
			<div className="mb-10 flex justify-between items-center print:hidden border-b pb-8 border-gray-100">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-full bg-[#0a0e1a] flex items-center justify-center text-[#d4af37]">
						<Compass className="h-6 w-6" />
					</div>
					<h1 className="font-serif text-2xl font-bold tracking-tight">Spiritual Roadmap</h1>
				</div>
				<button
					onClick={() => window.print()}
					className="bg-[#d4af37] text-[#0a0e1a] px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-transform"
				>
					<Printer className="mr-2 h-4 w-4" /> Print Itinerary
				</button>
			</div>

			{/* Branded Header */}
			<div className="text-center space-y-4 mb-16">
				<h1 className="text-4xl font-display font-bold tracking-[0.2em] text-[#0a0e1a]">AMBADY</h1>
				<p className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37]">Pilgrimage Experiences</p>
				<div className="w-20 h-0.5 bg-[#d4af37]/40 mx-auto" />
			</div>

			<div className="space-y-12">
				<div className="space-y-4">
					<h2 className="text-5xl font-serif font-bold tracking-tight">{tour.name}</h2>
					<div className="flex items-center gap-8 text-sm font-bold uppercase tracking-widest text-[#d4af37]">
						<span className="flex items-center gap-2"><MapPin className="h-4 w-4 text-gray-300" /> {tour.destination}</span>
						<span className="flex items-center gap-2"><Calendar className="h-4 w-4 text-gray-300" /> {tour.start_date || "Flexible"}</span>
					</div>
				</div>

				<div className="space-y-6">
					<h3 className="text-xl font-serif font-bold border-b pb-2 border-gray-100">Overview</h3>
					<p className="text-lg leading-relaxed text-gray-600">{tour.overview}</p>
				</div>

				<div className="space-y-10">
					<h3 className="text-xl font-serif font-bold border-b pb-2 border-gray-100">Daily Roadmap</h3>
					<div className="space-y-10">
						{tour.itinerary?.sort((a: any, b: any) => a.day_number - b.day_number).map((day: any) => (
							<div key={day.id} className="flex gap-8">
								<div className="h-10 w-10 min-w-[2.5rem] rounded-full border border-[#d4af37] flex items-center justify-center font-serif text-lg text-[#d4af37]">
									{day.day_number}
								</div>
								<div className="space-y-2">
									<h4 className="text-xl font-serif font-bold">{day.title}</h4>
									<p className="text-gray-600 leading-relaxed">{day.description}</p>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div className="mt-32 pt-10 border-t border-gray-100 text-center opacity-40">
				<p className="text-[10px] font-bold uppercase tracking-widest mb-2">Faith | Heritage | Inner Journeys</p>
				<p className="text-[8px] font-mono">Generated on {format(new Date(), "dd MMM yyyy")}</p>
			</div>
		</div>
	);
}
