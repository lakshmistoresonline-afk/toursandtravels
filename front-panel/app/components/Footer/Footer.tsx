import { Link } from "react-router";

export default function Footer() {
	return (
		<footer className="bg-[#0a0e1a] border-t border-[#d4af37]/20 py-24 mt-0 relative z-10">
			<div className="container mx-auto px-6">
				<div className="flex flex-col md:flex-row justify-between items-start gap-16">
					<div className="flex flex-col items-start gap-6 max-w-sm">
						<div className="flex items-center gap-3">
							<span className="text-3xl font-display font-bold tracking-[0.2em] text-[#d4af37]">
								AMBADY
							</span>
						</div>
						<p className="text-[11px] text-[#fdfcf0]/50 uppercase tracking-[0.4em] font-bold leading-loose">
							"Faith | Heritage | Inner Journeys"
						</p>
						<p className="text-xs text-[#fdfcf0]/40 font-serif italic">
							Rooted in tradition, guiding you through sacred paths to the divine essence within.
						</p>
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-12 text-[10px] font-bold uppercase tracking-[0.3em]">
						<div className="flex flex-col gap-6">
							<span className="text-[#d4af37]">Navigation</span>
							<Link to="/" className="text-[#fdfcf0]/60 hover:text-[#d4af37] transition-colors">Home</Link>
							<Link to="/tours" className="text-[#fdfcf0]/60 hover:text-[#d4af37] transition-colors">Journeys</Link>
							<Link to="/about" className="text-[#fdfcf0]/60 hover:text-[#d4af37] transition-colors">About Us</Link>
						</div>
						<div className="flex flex-col gap-6">
							<span className="text-[#d4af37]">Community</span>
							<Link to="/contact-us" className="text-[#fdfcf0]/60 hover:text-[#d4af37] transition-colors">Contact</Link>
							<Link to="/forgot-password" title="Reset Access" className="text-[#fdfcf0]/60 hover:text-[#d4af37] transition-colors">Reset Access</Link>
						</div>
						<div className="flex flex-col gap-6">
							<span className="text-[#d4af37]">Sacred Terms</span>
							<Link to="/privacy-policy" className="text-[#fdfcf0]/60 hover:text-[#d4af37] transition-colors">Privacy</Link>
							<Link to="/terms-of-usage" className="text-[#fdfcf0]/60 hover:text-[#d4af37] transition-colors">Terms</Link>
						</div>
					</div>
				</div>

				<div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-8">
					<p className="text-[9px] text-[#fdfcf0]/30 uppercase tracking-[0.2em] font-medium">
						© {new Date().getFullYear()} AMBADY — PILGRIMAGE EXPERIENCES. ALL RIGHTS RESERVED.
					</p>
					<div className="flex items-center gap-6">
						<span className="text-[9px] text-[#d4af37]/60 uppercase tracking-[0.25em] font-bold">
							From Thiruvambady to a Higher You
						</span>
					</div>
				</div>
			</div>
		</footer>
	);
}
