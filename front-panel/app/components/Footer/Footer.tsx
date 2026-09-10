import { Heart } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t border-[#d4af37]/20 bg-[#0a0e1a]/80 backdrop-blur-md mt-20">
			<div className="container mx-auto py-16 px-4">
				<div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
					<div className="space-y-4 max-w-sm">
						<div className="flex flex-col">
							<span className="text-3xl font-display font-bold tracking-widest text-[#d4af37]">AMBADY</span>
							<span className="text-[10px] font-sans font-bold text-[#fdfcf0]/60 uppercase tracking-[0.3em] mt-1">Pilgrimage Experiences</span>
						</div>
						<p className="text-sm text-[#fdfcf0]/60 font-sans leading-relaxed">
							Sacred Destinations. Meaningful Journeys. Faith | Heritage | Inner Journeys. Pilgrimage Begins Here.
						</p>
					</div>

					<div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
						<div className="space-y-4">
							<h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">Explore</h4>
							<ul className="space-y-2 text-sm text-[#fdfcf0]/50 font-medium">
								<li><a href="/" className="hover:text-[#d4af37] transition-colors">Home</a></li>
								<li><a href="/tours" className="hover:text-[#d4af37] transition-colors">Pilgrimage Journeys</a></li>
								<li><a href="/about" className="hover:text-[#d4af37] transition-colors">About Us</a></li>
							</ul>
						</div>
						<div className="space-y-4">
							<h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37]">Support</h4>
							<ul className="space-y-2 text-sm text-[#fdfcf0]/50 font-medium">
								<li><a href="/contact-us" className="hover:text-[#d4af37] transition-colors">Contact</a></li>
							</ul>
						</div>
					</div>
				</div>

				<div className="flex flex-col gap-6 border-t border-[#d4af37]/10 mt-16 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-[#fdfcf0]/40 sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} AMBADY PILGRIMAGE EXPERIENCES. ALL RIGHTS RESERVED.</p>
					<div className="flex items-center gap-6">
						<a href="/privacy-policy" className="hover:text-[#d4af37] transition-colors">Privacy</a>
						<a href="/terms-of-usage" className="hover:text-[#d4af37] transition-colors">Terms</a>
						<span className="flex gap-2 items-center text-[#d4af37]/60">
							<span>Faith Journey</span>
							<Heart className="size-3 fill-[#d4af37]/60" />
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
