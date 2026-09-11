import { Button } from "~/components/ui/button";
import { Link } from "react-router";

export default function HeroSection({ user }: { user?: any }) {
	return (
		<section className="relative w-full overflow-hidden bg-transparent min-h-[75vh] flex items-center justify-center">
			{/* Content - Hero Visual identity already in global background */}
			<div className="relative z-10 text-center space-y-12 px-6 animate-in fade-in zoom-in-95 duration-1000">
				<div className="space-y-4">
					<h2 className="text-6xl md:text-8xl font-serif text-[#fdfcf0] tracking-tight drop-shadow-2xl">
						Sacred Journeys
					</h2>
					<p className="text-[12px] text-[#d4af37] uppercase tracking-[0.6em] font-bold">
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
