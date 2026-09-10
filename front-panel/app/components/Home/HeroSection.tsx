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
				</div>
			</div>

			{/* Subtle Scroll Indicator */}
			<div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce opacity-30 hidden md:block">
				<div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-[#d4af37] to-transparent" />
			</div>
		</section>
	);
}
