import { useLoaderData, redirect, type LoaderFunctionArgs, Link } from "react-router";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";
import { Calendar, MapPin, Compass } from "lucide-react";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import { BookingService } from "@workspace/shared/services/booking.service";
import { MetaDetails } from "~/components/SEO/MetaDetails";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user) return redirect("/login");

	try {
		const svc = new BookingService();
		const result = await svc.getMyRegistrations();
		return { registrations: result.registrations };
	} catch (error) {
		return { registrations: [] };
	}
};

export default function MyBookingsPage() {
	const { registrations } = useLoaderData<any>();

	return (
		<div className="container mx-auto max-w-5xl px-4 animate-in fade-in duration-700">
			<MetaDetails metaTitle="My Pilgrimage Journeys | AMBADY" metaDescription="View your upcoming and past sacred journeys." />
			<div className="mb-12">
				<h4 className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#d4af37] mb-2">History</h4>
				<h1 className="text-4xl font-serif text-[#fdfcf0]">My Pilgrimage History</h1>
				<p className="text-[#fdfcf0]/40 mt-3 text-sm font-sans font-light uppercase tracking-widest leading-relaxed">View your past and upcoming sacred registrations.</p>
			</div>

			{registrations.length === 0 ? (
				<div className="py-32 text-center glass-card rounded-[3rem] border border-dashed border-[#d4af37]/20">
					<Compass className="h-12 w-12 text-[#d4af37]/20 mx-auto mb-6" />
					<p className="text-[#fdfcf0]/40 text-sm font-bold uppercase tracking-widest">You haven't joined any pilgrimage journeys yet.</p>
					<Link to="/tours" className="text-[#d4af37] hover:text-[#fdfcf0] mt-6 inline-block text-[10px] font-bold uppercase tracking-[0.2em] border-b border-[#d4af37]/40 pb-1 transition-all">Explore Sacred Pilgrimage Journeys</Link>
				</div>
			) : (
				<div className="grid gap-8">
					{registrations.map((reg: any) => (
						<Card key={reg.id} className="glass-card border border-white/5 rounded-[2.5rem] overflow-hidden group hover:border-[#d4af37]/20 transition-all duration-500">
							<CardContent className="p-0">
								<div className="flex flex-col md:flex-row">
									<div className="w-full md:w-64 h-48 md:h-auto overflow-hidden">
										<img
											src={reg.tours?.cover_image || "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=800&q=80"}
											alt={reg.tours?.name}
											className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700"
										/>
									</div>
									<div className="p-10 flex-1 space-y-6">
										<div className="flex justify-between items-start gap-4">
											<div className="space-y-2">
												<h3 className="text-2xl font-serif text-[#fdfcf0] group-hover:text-[#d4af37] transition-colors">{reg.tours?.name}</h3>
												<div className="flex items-center gap-6 text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-widest">
													<span className="flex items-center gap-2"><MapPin className="h-3 w-3 text-[#d4af37]" /> {reg.tours?.destination}</span>
													<span className="flex items-center gap-2"><Calendar className="h-3 w-3 text-[#d4af37]" /> {reg.tours?.start_date || 'TBD'}</span>
												</div>
											</div>
											<Badge className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest border ${reg.status === 'CONFIRMED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20'}`}>
												{reg.status}
											</Badge>
										</div>
										<div className="pt-6 border-t border-white/5 flex justify-between items-center text-[10px] font-bold uppercase tracking-widest">
											<div className="text-[#fdfcf0]/70">
												<span className="text-[#d4af37]">{reg.travellersCount}</span> Pilgrims Registered
											</div>
											<div className="text-[#fdfcf0]/30 italic font-light">
												{reg.createdAt ? format(new Date(reg.createdAt), "PPP") : 'Recently'}
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}
		</div>
	);
}
