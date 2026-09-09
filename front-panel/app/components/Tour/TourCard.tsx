import { MapPin, Calendar, Users, ArrowRight } from "lucide-react";
import { memo } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent } from "~/components/ui/card";

export const TourCard = memo(
	({
		tour,
		className,
	}: {
		tour: any;
		className?: string;
	}) => {
		const statusColors: any = {
			REGISTRATION_OPEN: "bg-green-100 text-green-700 border-green-200",
			PUBLISHED: "bg-blue-100 text-blue-700 border-blue-200",
			REGISTRATION_CLOSED: "bg-red-100 text-red-700 border-red-200",
			DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
		};

		return (
			<Link to={"/tours/tour/" + tour.id} className="group block h-full">
				<Card className={`h-full overflow-hidden border border-slate-200 shadow-sm group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300 rounded-3xl ${className ?? ""}`}>
					{/* Image Section */}
					<div className="relative aspect-[4/3] overflow-hidden">
						<img
							src={tour.cover_image || "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80"}
							alt={tour.name}
							className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
						/>
						<div className="absolute top-4 left-4 z-20">
							<Badge className={`px-3 py-1 text-xs font-bold uppercase tracking-wider border ${statusColors[tour.status] || ""}`}>
								{tour.status?.replace('_', ' ')}
							</Badge>
						</div>
						<div className="absolute bottom-4 left-4 z-20">
							<Badge variant="secondary" className="bg-white/90 backdrop-blur-md text-slate-900 border-none shadow-sm gap-1.5 px-3 py-1">
								<MapPin className="h-3.5 w-3.5 text-primary" />
								<p className="font-semibold">{tour.destination || 'Global'}</p>
							</Badge>
						</div>
					</div>

					{/* Content Section */}
					<CardContent className="p-6 flex flex-col h-fit">
						<div className="flex-1 space-y-3">
							<h3 className="font-bold text-xl leading-snug line-clamp-2 text-slate-900 group-hover:text-primary transition-colors">
								{tour.name}
							</h3>

							<div className="flex items-center gap-4 text-slate-500 text-sm">
								<div className="flex items-center gap-1.5">
									<Calendar className="h-4 w-4" />
									<span>{tour.start_date ? new Date(tour.start_date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' }) : 'Flexible'}</span>
								</div>
								<div className="flex items-center gap-1.5">
									<Users className="h-4 w-4" />
									<span>Max {tour.max_participants || 20}</span>
								</div>
							</div>
						</div>

						<div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
							<div>
								<p className="text-xs text-slate-400 font-semibold uppercase tracking-widest mb-0.5">Price from</p>
								<p className="font-extrabold text-2xl text-slate-900">₹{tour.price?.toLocaleString()}</p>
							</div>
							<div className="h-12 w-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all duration-300">
								<ArrowRight className="h-5 w-5" />
							</div>
						</div>
					</CardContent>
				</Card>
			</Link>
		);
	},
);
