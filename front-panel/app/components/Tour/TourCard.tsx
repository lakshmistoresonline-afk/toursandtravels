import { MapPin, Calendar, Users, ArrowRight, Clock } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";

export const TourCard = memo(
	({
		tour,
		className,
	}: {
		tour: any;
		className?: string;
	}) => {
		const statusColors: any = {
			REGISTRATION_OPEN: "text-emerald-400 border-emerald-400/30 bg-emerald-400/10",
			PUBLISHED: "text-[#d4af37] border-[#d4af37]/30 bg-[#d4af37]/10",
			REGISTRATION_CLOSED: "text-red-400 border-red-400/30 bg-red-400/10",
			DRAFT: "text-slate-400 border-slate-400/30 bg-slate-400/10",
		};

		return (
			<Link to={"/tours/tour/" + tour.id} className="group block h-full">
				<div className={`h-full flex flex-col ivory-glass-card rounded-[2rem] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-[#d4af37]/20 hover:-translate-y-2 border border-[#d4af37]/20 ${className ?? ""}`}>
					{/* Image Section */}
					<div className="relative aspect-[5/4] overflow-hidden">
						<img
							src={tour.cover_image || "https://images.unsplash.com/photo-1548013146-72479768bbaa?auto=format&fit=crop&w=800&q=80"}
							alt={tour.name}
							className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-[#0a0e1a]/40 via-transparent to-transparent" />

						<div className="absolute top-6 left-6 z-20">
							<Badge className={`px-4 py-1.5 text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md rounded-full bg-white/80 ${statusColors[tour.status] || ""}`}>
								{tour.status?.replace('_', ' ')}
							</Badge>
						</div>

						<div className="absolute bottom-6 left-6 z-20">
							<div className="flex items-center gap-2 text-white drop-shadow-md">
								<MapPin className="h-4 w-4 text-[#d4af37]" />
								<p className="text-xs font-bold uppercase tracking-widest">{tour.destination || 'Holy Land'}</p>
							</div>
						</div>
					</div>

					{/* Content Section */}
					<div className="p-8 flex flex-col flex-1 gap-6">
						<div className="flex-1 space-y-4">
							<h3 className="font-serif text-2xl leading-tight text-[#0a0e1a] group-hover:text-[#b8860b] transition-colors line-clamp-2">
								{tour.name}
							</h3>

							<div className="flex items-center gap-6 text-[#0a0e1a]/60 text-[10px] font-bold uppercase tracking-widest">
								<div className="flex items-center gap-2">
									<Calendar className="h-3.5 w-3.5 text-[#b8860b]" />
									<span>{tour.start_date ? new Date(tour.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Spiritual'}</span>
								</div>
								<div className="flex items-center gap-2">
									<Clock className="h-3.5 w-3.5 text-[#b8860b]" />
									<span>{tour.duration || '8 Days'}</span>
								</div>
							</div>
						</div>

						<div className="pt-6 border-t border-[#d4af37]/20 flex items-center justify-between">
							<div>
								<p className="text-[10px] text-[#0a0e1a]/40 font-bold uppercase tracking-[0.2em] mb-1">Exchange</p>
								<p className="font-serif text-3xl text-[#b8860b]">₹{tour.price?.toLocaleString()}</p>
							</div>
							<div className="h-14 w-14 rounded-full border border-[#d4af37]/30 flex items-center justify-center text-[#b8860b] group-hover:bg-[#d4af37] group-hover:text-[#0a0e1a] transition-all duration-500 shadow-lg">
								<ArrowRight className="h-6 w-6 group-hover:translate-x-1 transition-transform" />
							</div>
						</div>
					</div>
				</div>
			</Link>
		);
	},
);
