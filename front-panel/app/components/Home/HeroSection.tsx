import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export default function HeroSection({ user }: { user?: any }) {
	return (
		<section className="relative w-full overflow-hidden bg-transparent min-h-[85vh] flex items-center justify-center">
			{/* Content overlay */}
			<div className="relative z-10 text-center space-y-16 px-6 animate-in fade-in zoom-in-95 duration-1000 max-w-4xl mx-auto">
				{/* We keep the HTML overlay minimal as the branding is in the artwork */}
				<div className="space-y-6">
					<h2 className="text-6xl md:text-8xl font-serif text-[#fdfcf0] tracking-tight drop-shadow-2xl leading-tight">
						Sacred Journeys
					</h2>
					<div className="w-32 h-0.5 bg-primary/60 mx-auto rounded-full" />
					<p className="text-[11px] md:text-xs text-primary uppercase tracking-[0.6em] font-bold drop-shadow-md">
						Faith | Heritage | Inner Journeys
					</p>
				</div>

				{!user ? (
					<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
						<Button
							size="lg"
							className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-12 h-16 text-xs font-bold uppercase tracking-widest shadow-2xl shadow-primary/20 transition-all hover:scale-105"
							asChild
						>
							<Link to="/tours">Explore Pilgrimage Journeys</Link>
						</Button>
						<Button
							variant="outline"
							size="lg"
							className="rounded-full border-white/20 text-[#fdfcf0]/90 hover:bg-white/10 px-12 h-16 text-xs font-bold uppercase tracking-widest backdrop-blur-sm transition-all"
							asChild
						>
							<Link to="/about">Learn About AMBADY</Link>
						</Button>
					</div>
				) : (
					<Button
						size="lg"
						className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-12 h-16 text-xs font-bold uppercase tracking-widest shadow-2xl shadow-primary/20"
						asChild
					>
						<Link to="/tours">View Upcoming Journeys</Link>
					</Button>
				)}
			</div>
		</section>
	);
}
