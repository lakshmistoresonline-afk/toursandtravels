import { MapPin } from "lucide-react";
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
		return (
			<div className="relative h-full">
				<Link
					to={"/tours/tour/" + tour.id}
					viewTransition
				>
					<div
						className={`h-full border group overflow-hidden bg-card rounded-xl cursor-pointer ${className ?? ""}`}
					>
						<div className="relative overflow-hidden select-none">
							<img
								src={tour.cover_image || "/placeholder-tour.jpg"}
								alt={tour.name}
								className="w-full h-48 object-cover transition-transform duration-300 ease-out group-hover:scale-[104%]"
							/>
							<div className="absolute bottom-2 left-3 z-20">
								<Badge className="gap-1.5">
									<MapPin className="h-3 w-3" />
									<p>{tour.destination || 'Various'}</p>
								</Badge>
							</div>
						</div>

						<div className="p-4 flex flex-col justify-between">
							<h3 className="font-bold text-lg line-clamp-2">{tour.name}</h3>
							<div className="mt-4 flex items-center justify-between">
								<div>
									<p className="text-xs text-muted-foreground">Starting from</p>
									<p className="font-bold text-lg text-primary">{tour.price?.toLocaleString()} AED</p>
								</div>
								<Badge variant="secondary">{tour.status?.replace('_', ' ').toLowerCase()}</Badge>
							</div>
						</div>
					</div>
				</Link>
			</div>
		);
	},
);
