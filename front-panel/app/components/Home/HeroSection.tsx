import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Compass } from "lucide-react";

const logo = "/brand/amady-logo.png";

export default function HeroSection({ hero_sections = [] }: { hero_sections: any[] }) {
	return (
		<section className="relative min-h-[95vh] w-full overflow-hidden flex items-center justify-center pt-24">
			{/* Floating Content */}
			<div className="relative z-20 container mx-auto px-4 text-center text-[#fdfcf0] space-y-12">
				<div className="space-y-8 max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000">
					<div className="mx-auto w-40 h-40 transition-transform duration-700 hover:rotate-[360deg]">
						<img src={logo} alt="Amady Logo" className="w-full h-full object-contain drop-shadow-[0_0_20px_rgba(212,175,55,0.4)]" />
					</div>

					<div className="space-y-4">
						<h1 className="text-6xl md:text-9xl font-display font-bold tracking-[0.2em] leading-tight text-[#d4af37]">
							AMADY
						</h1>
						<p className="text-[10px] md:text-xs font-sans font-bold text-[#fdfcf0]/60 uppercase tracking-[0.8em] mb-8">
							Pilgrimage Experiences
						</p>
					</div>

					<div className="space-y-6">
						<p className="text-2xl md:text-4xl font-serif italic tracking-wide text-[#fdfcf0]/90">
							"Pilgrimage Begins Here"
						</p>
						<p className="text-lg md:text-xl text-[#fdfcf0]/60 font-sans font-light max-w-3xl mx-auto leading-relaxed uppercase tracking-[0.15em]">
							Sacred Destinations. Meaningful Journeys. <br className="hidden md:block" />
							Faith | Heritage | Inner Journeys.
						</p>
					</div>

					<div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-10">
						<Button size="xl" className="w-full sm:w-auto rounded-full bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] px-12 py-8 text-sm font-bold uppercase tracking-widest shadow-2xl shadow-[#d4af37]/20 group transition-all" asChild>
							<Link to="/tours">
								Explore Pilgrimage Journeys
								<Compass className="ml-3 h-5 w-5 group-hover:rotate-45 transition-transform" />
							</Link>
						</Button>
						<Button size="xl" variant="outline" className="w-full sm:w-auto rounded-full border-[#d4af37]/40 text-[#d4af37] hover:bg-[#d4af37]/10 px-12 py-8 text-sm font-bold uppercase tracking-widest backdrop-blur-sm transition-all" asChild>
							<Link to="/contact-us">
								Contact Us
								<ArrowRight className="ml-3 h-5 w-5" />
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Decorative elements */}
			<div className="absolute bottom-12 left-1/2 -translate-x-1/2 animate-bounce opacity-40">
				<div className="w-[1px] h-20 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent" />
			</div>
		</section>
	);
}
