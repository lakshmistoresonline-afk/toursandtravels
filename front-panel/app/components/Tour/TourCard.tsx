import { MapPin, Calendar, Compass } from "lucide-react";
import { memo, useState } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import type { HighLevelTour } from "@workspace/shared/types/tours";
import { cn } from "@workspace/shared/utils/ui";

export const TourCard = memo(({ tour, className }: { tour: HighLevelTour; className?: string }) => {
	const [imgError, setImgError] = useState(false);

	const statusColors: any = {
		REGISTRATION_OPEN: "text-emerald-600 border-emerald-600/20 bg-emerald-600/5",
		PUBLISHED: "text-primary border-primary/20 bg-primary/5",
		REGISTRATION_CLOSED: "text-red-600 border-red-600/20 bg-red-600/5",
		DRAFT: "text-slate-500 border-slate-500/30 bg-slate-500/5",
	};

	const hasValidImage =
		!imgError && tour.cover_image && tour.cover_image.startsWith("http");

	return (
		<Link to={"/tours/tour/" + tour.id} prefetch="intent" viewTransition className="group block h-full">
			<div
				className={cn(
					"h-full flex flex-col bg-card rounded-[1.5rem] overflow-hidden transition-all duration-500 border border-primary/10 shadow-sm",
					"hover:border-primary/40 hover:shadow-xl hover:-translate-y-1",
					className,
				)}
			>
				{/* Image Section */}
				<div className="relative aspect-[4/3] overflow-hidden bg-muted">
					{hasValidImage ? (
						<img
							src={tour.cover_image!}
							alt={tour.name}
							onError={() => setImgError(true)}
							className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
						/>
					) : (
						<div className="w-full h-full flex flex-col items-center justify-center gap-3 bg-primary/5">
							<Compass className="h-10 w-10 text-primary opacity-30" />
							<span className="text-[9px] font-bold uppercase tracking-[0.3em] text-primary/40">
								Sacred Path
							</span>
						</div>
					)}

					{/* Floating Status Badge */}
					<div className="absolute top-4 left-4 z-20">
						<Badge
							className={cn(
								"px-4 py-2 text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md rounded-full shadow-lg",
								statusColors[tour.status] || "",
							)}
						>
							{tour.status?.replace("_", " ")}
						</Badge>
					</div>
				</div>

				{/* Content Section */}
				<div className="p-7 flex flex-col flex-1 gap-6">
					<div className="flex-1 space-y-4">
						<h3 className="font-serif text-2xl leading-tight text-foreground group-hover:text-primary transition-colors line-clamp-2">
							{tour.name}
						</h3>

						<div className="flex flex-wrap items-center gap-6 text-foreground/70 text-xs font-bold uppercase tracking-wider">
							<div className="flex items-center gap-2">
								<MapPin className="h-4 w-4 text-primary" />
								<span>{tour.destination || "Holy Land"}</span>
							</div>
							<div className="flex items-center gap-2">
								<Calendar className="h-4 w-4 text-primary" />
								<span>{tour.start_date || "Flexible"}</span>
							</div>
						</div>
					</div>

					<div className="pt-6 border-t border-primary/10 flex items-center justify-between">
						<div className="space-y-1">
							<p className="text-[11px] text-foreground/50 uppercase tracking-wider font-bold">
								Exchange
							</p>
							<p className="font-serif text-3xl text-primary font-bold">
								{tour.price > 0 ? `₹${tour.price.toLocaleString()}` : "Inquire"}
							</p>
						</div>
						<div className="text-[10px] font-bold uppercase tracking-wider text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all bg-primary/5 px-6 py-3 rounded-full border border-primary/20">
							View Details
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
});
