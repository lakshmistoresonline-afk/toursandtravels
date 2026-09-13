import { Link } from "react-router";

export default function Footer() {
	return (
		<footer className="bg-[#0a0e1a] border-t border-[#d4af37]/20 py-24 mt-0 relative z-10">
			<div className="container mx-auto px-6">
				<div className="flex flex-col md:flex-row justify-between items-start gap-16">
					<div className="flex flex-col items-start gap-6 max-w-sm">
						<div className="flex items-center gap-3">
							<span className="text-4xl font-display font-bold tracking-[0.2em] text-[#d4af37]">
								AMBADY
							</span>
						</div>
						<p className="text-xs text-[#fdfcf0]/70 uppercase tracking-[0.4em] font-bold leading-loose">
							"Faith | Heritage | Inner Journeys"
						</p>
						<p className="text-base text-[#fdfcf0]/60 font-serif italic leading-relaxed">
							Rooted in tradition, guiding you through sacred paths to the divine essence within.
						</p>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-16 text-xs font-bold uppercase tracking-[0.3em]">
						<div className="flex flex-col gap-8">
							<span className="text-[#d4af37] text-sm">Navigation</span>
							<Link to="/" className="text-[#fdfcf0]/80 hover:text-[#d4af37] transition-colors">Home Sanctuary</Link>
							<Link to="/tours" className="text-[#fdfcf0]/80 hover:text-[#d4af37] transition-colors">Sacred Journeys</Link>
							<Link to="/about" className="text-[#fdfcf0]/80 hover:text-[#d4af37] transition-colors">About Our Path</Link>
						</div>
						<div className="flex flex-col gap-8">
							<span className="text-[#d4af37] text-sm">Community</span>
							<Link to="/contact-us" className="text-[#fdfcf0]/80 hover:text-[#d4af37] transition-colors">Reach Us</Link>
							<Link to="/forgot-password" title="Reset Access" className="text-[#fdfcf0]/80 hover:text-[#d4af37] transition-colors">Reset Access</Link>
						</div>
						<div className="flex flex-col gap-8">
							<span className="text-[#d4af37] text-sm">Sacred Terms</span>
							<Link to="/privacy-policy" className="text-[#fdfcf0]/80 hover:text-[#d4af37] transition-colors">Privacy Map</Link>
							<Link to="/terms-of-usage" className="text-[#fdfcf0]/80 hover:text-[#d4af37] transition-colors">Usage Scroll</Link>
						</div>
					</div>
				</div>

				<div className="mt-32 pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-10">
					<p className="text-[10px] text-[#fdfcf0]/40 uppercase tracking-[0.2em] font-bold">
						© {new Date().getFullYear()} AMBADY — PILGRIMAGE EXPERIENCES. ALL RIGHTS RESERVED.
					</p>
					<div className="flex items-center gap-8">
						<span className="text-[10px] text-[#d4af37]/80 uppercase tracking-[0.3em] font-black">
							From Thiruvambady to a Higher You
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
