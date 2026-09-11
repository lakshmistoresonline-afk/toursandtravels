import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Compass } from "lucide-react";

export default function HeroSection({ hero_sections = [], user }: { hero_sections: any[]; user?: any }) {
	return (
		<section className="relative w-full overflow-hidden bg-[#0a0e1a] min-h-[70vh] flex items-center justify-center">
			{/* Hero Visual - Clean Background */}
			<div className="absolute inset-0 z-0">
				<img
					src="/brand/ambady-background.png"
					alt="Ambady Pilgrimage"
					className="w-full h-full object-cover object-top opacity-30 grayscale"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/80 via-[#0a0e1a]/40 to-[#0a0e1a]" />
			</div>

			{/* Hero Content - Clean & Minimal */}
			<div className="relative z-10 text-center space-y-10 px-4 animate-in fade-in zoom-in-95 duration-1000">
				<div className="space-y-4">
					<h2 className="text-5xl md:text-7xl font-serif text-[#fdfcf0] tracking-tight">
						Sacred Journeys
					</h2>
					<p className="text-[10px] text-[#d4af37] uppercase tracking-[0.6em] font-bold">
						Rooted in Faith | Heritage | Devotion
					</p>
				</div>

				{!user ? (
					<div className="flex flex-col sm:flex-row items-center justify-center gap-4">
						<Button className="rounded-full bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] px-12 h-14 text-[10px] font-bold uppercase tracking-widest transition-all shadow-xl shadow-[#d4af37]/10" asChild>
							<Link to="/login">Begin Your Journey</Link>
						</Button>
						<Button variant="outline" className="rounded-full border-[#d4af37]/20 text-[#fdfcf0]/60 hover:text-[#d4af37] hover:border-[#d4af37]/40 px-12 h-14 text-[10px] font-bold uppercase tracking-widest transition-all" asChild>
							<Link to="/signup">Create Account</Link>
						</Button>
					</div>
				) : (
					<Button className="rounded-full border border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 px-12 h-14 text-[10px] font-bold uppercase tracking-widest transition-all" asChild>
						<Link to="/contact-us">Inquire About Custom Pilgrimages</Link>
					</Button>
				)}
			</div>
		</section>
	);
}
