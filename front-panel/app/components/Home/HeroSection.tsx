import { Button } from "~/components/ui/button";
import { Link } from "react-router";
import { ArrowRight, Compass } from "lucide-react";

export default function HeroSection({ hero_sections = [] }: { hero_sections: any[] }) {
	return (
		<section className="relative min-h-[75vh] md:min-h-[85vh] w-full flex items-center justify-center pt-32 pb-16">
			{/* Hero Content Area - Focused on Actions & Live Discovery */}
			<div className="relative z-20 container mx-auto px-4">
				<div className="max-w-4xl mx-auto text-center space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-1000">
					{/* Minimal foreground content to avoid background duplication */}
					<div className="space-y-4">
						<h2 className="text-3xl md:text-5xl font-serif text-[#fdfcf0] tracking-tight drop-shadow-md">
							Discover Your Next Pilgrimage
						</h2>
						<p className="text-base md:text-lg text-[#fdfcf0]/80 font-sans font-light max-w-2xl mx-auto leading-relaxed tracking-wide drop-shadow-sm uppercase">
							Connect with sacred traditions through curated spiritual journeys.
						</p>
					</div>

					{/* Live Application Actions */}
					<div className="flex flex-col sm:flex-row items-center justify-center gap-6">
						<Button size="xl" className="w-full sm:w-auto rounded-full bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] px-12 py-8 text-sm font-bold uppercase tracking-widest shadow-2xl shadow-[#d4af37]/30 group transition-all" asChild>
							<Link to="/tours">
								Explore Pilgrimage Journeys
								<Compass className="ml-3 h-5 w-5 group-hover:rotate-45 transition-transform" />
							</Link>
						</Button>
						<Button size="xl" variant="outline" className="w-full sm:w-auto rounded-full border-[#d4af37]/40 text-[#fdfcf0] hover:bg-[#d4af37]/10 px-12 py-8 text-sm font-bold uppercase tracking-widest backdrop-blur-md transition-all shadow-lg" asChild>
							<Link to="/contact-us">
								Contact Us
								<ArrowRight className="ml-3 h-5 w-5" />
							</Link>
						</Button>
					</div>
				</div>
			</div>

			{/* Subtle Scroll Indicator */}
			<div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30 hidden md:block">
				<div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent" />
			</div>
		</section>
	);
}
