import { useLoaderData } from "react-router";
import { ToursService } from "@workspace/shared/services/tours.service";
import { BookingService } from "@workspace/shared/services/booking.service";
import { Compass, Phone, Hash, Calendar, MapPin } from "lucide-react";
import { format } from "date-fns";

export const clientLoader = async ({ params }: any) => {
	const svc = new ToursService();
	const bookingSvc = new BookingService();

	const tour = await svc.getTourDetails(params.id!);
	const registrationsResp = await bookingSvc.getTourRegistrations(params.id!);

	return { tour, registrations: registrationsResp.registrations.filter((r: any) => r.status === "CONFIRMED") };
};

export default function PilgrimManifestoPage() {
	const { tour, registrations } = useLoaderData<typeof clientLoader>();

	if (!tour) return <div className="p-20 text-center">Journey not found</div>;

	return (
		<div className="min-h-screen bg-white p-12 text-[#0a0e1a]">
			{/* Print Controls (Hidden on Print) */}
			<div className="mb-10 flex justify-between items-center print:hidden border-b pb-8 border-gray-100">
				<div className="flex items-center gap-3">
					<div className="h-10 w-10 rounded-full bg-[#0a0e1a] flex items-center justify-center text-[#d4af37]">
						<Compass className="h-6 w-6" />
					</div>
					<h1 className="font-serif text-2xl font-bold tracking-tight">Pilgrim Manifesto</h1>
				</div>
				<button
					onClick={() => window.print()}
					className="bg-[#d4af37] text-[#0a0e1a] px-8 py-3 rounded-full font-bold uppercase tracking-widest text-[10px] shadow-lg hover:scale-105 transition-transform"
				>
					Print Document
				</button>
			</div>

			{/* Manifesto Header */}
			<div className="space-y-10 mb-16">
				<div className="flex justify-between items-start">
					<div className="space-y-4">
						<h2 className="text-5xl font-serif font-bold tracking-tight">{tour.name}</h2>
						<div className="flex items-center gap-6 text-sm font-bold uppercase tracking-[0.2em] text-[#d4af37]">
							<span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> {tour.destination}</span>
							<span className="flex items-center gap-2"><Calendar className="h-4 w-4" /> {tour.start_date || "Flexible"}</span>
						</div>
					</div>
					<div className="text-right space-y-2">
						<p className="text-[10px] font-bold uppercase tracking-widest opacity-40">Document Generated</p>
						<p className="font-mono text-sm">{format(new Date(), "dd MMM yyyy HH:mm")}</p>
						<Badge variant="outline" className="border-gray-200 text-gray-400">{tour.tour_code}</Badge>
					</div>
				</div>

				<div className="grid grid-cols-3 gap-10 border-y border-gray-100 py-10">
					<div className="space-y-1">
						<p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Total Confirmed Pilgrims</p>
						<p className="text-3xl font-serif font-bold">{registrations.reduce((acc, r) => acc + r.travellersCount, 0)}</p>
					</div>
					<div className="space-y-1">
						<p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Total Groups</p>
						<p className="text-3xl font-serif font-bold">{registrations.length}</p>
					</div>
					<div className="space-y-1">
						<p className="text-[9px] font-bold uppercase tracking-widest opacity-40">Logistics Status</p>
						<p className="text-3xl font-serif font-bold text-emerald-600">READY</p>
					</div>
				</div>
			</div>

			{/* Detailed Pilgrim Table */}
			<table className="w-full border-collapse">
				<thead>
					<tr className="bg-gray-50 text-left">
						<th className="p-5 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest">Bus</th>
						<th className="p-5 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest">Room</th>
						<th className="p-5 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest text-center">#</th>
						<th className="p-5 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest">Pilgrim Name</th>
						<th className="p-5 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest">Age</th>
						<th className="p-5 border-b border-gray-200 text-[10px] font-bold uppercase tracking-widest">Contact & Identity</th>
					</tr>
				</thead>
				<tbody className="divide-y divide-gray-100">
					{registrations.map((reg: any) => (
						<>
							{/* Primary Traveller Row */}
							<tr key={reg.id} className="hover:bg-gray-50/50 transition-colors">
								<td className="p-5 font-bold text-primary font-mono">{reg.busNumber || "-"}</td>
								<td className="p-5 font-bold text-primary font-mono">{reg.roomNumber || "-"}</td>
								<td className="p-5 text-center font-bold">1</td>
								<td className="p-5">
									<div className="flex items-center gap-3">
										<div className="h-2 w-2 rounded-full bg-primary" />
										<span className="font-bold text-lg">{reg.profileSnapshot?.first_name} {reg.profileSnapshot?.last_name}</span>
									</div>
								</td>
								<td className="p-5 font-medium">Adult</td>
								<td className="p-5">
									<div className="space-y-1 text-xs opacity-60 font-medium">
										<div className="flex items-center gap-2"><Phone className="h-3 w-3" /> {reg.profileSnapshot?.phone_number}</div>
										<div className="flex items-center gap-2"><Hash className="h-3 w-3" /> {reg.profileSnapshot?.aadhar_number || "No Aadhar"}</div>
									</div>
								</td>
							</tr>

							{/* Additional Travellers Rows */}
							{reg.additionalTravellers?.map((traveller: any, idx: number) => (
								<tr key={`${reg.id}-traveller-${idx}`} className="border-l-4 border-l-gray-50 hover:bg-gray-50/50 transition-colors">
									<td className="p-5 text-gray-300 font-mono text-xs">{reg.busNumber || "-"}</td>
									<td className="p-5 text-gray-300 font-mono text-xs">{reg.roomNumber || "-"}</td>
									<td className="p-5 text-center text-gray-400 font-medium">{idx + 2}</td>
									<td className="p-5 pl-10 text-gray-600 font-medium">{traveller.name}</td>
									<td className="p-5 text-gray-600 font-medium">{traveller.age} yrs</td>
									<td className="p-5 text-gray-300 italic text-[10px]">Group Member</td>
								</tr>
							))}
						</>
					))}
				</tbody>
			</table>

			{/* Manifesto Footer */}
			<div className="mt-20 pt-10 border-t border-gray-100 flex justify-between items-center opacity-50">
				<div className="flex items-center gap-3">
					<span className="font-display font-bold tracking-widest text-sm">AMBADY</span>
					<span className="text-[8px] font-bold uppercase tracking-widest">Pilgrimage Experiences</span>
				</div>
				<p className="text-[9px] font-bold uppercase tracking-widest italic">Faith | Heritage | Inner Journeys</p>
			</div>
		</div>
	);
}

function Badge({ children, className }: any) {
	return <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border", className)}>{children}</span>
}

function cn(...inputs: any[]) {
	return inputs.filter(Boolean).join(" ");
}
