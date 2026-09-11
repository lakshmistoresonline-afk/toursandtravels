import { Link } from "react-router";

export default function Footer() {
	return (
		<footer className="bg-[#0a0e1a]/95 border-t border-[#d4af37]/20 py-16 mt-20 relative z-10 backdrop-blur-xl">
			<div className="container mx-auto px-6">
				<div className="flex flex-col md:flex-row justify-between items-center gap-12">
					<div className="flex flex-col items-center md:items-start gap-4">
						<div className="flex items-center gap-3">
							<span className="text-2xl font-display font-bold tracking-widest text-[#d4af37]">AMBADY</span>
						</div>
						<p className="text-[10px] text-[#fdfcf0]/40 uppercase tracking-[0.4em] font-bold">Faith | Heritage | Inner Journeys</p>
					</div>

					<div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[#fdfcf0]/60">
						<Link to="/about" className="hover:text-[#d4af37] transition-colors">About</Link>
						<Link to="/contact-us" className="hover:text-[#d4af37] transition-colors">Contact</Link>
						<Link to="/forgot-password" title="Reset Access" className="hover:text-[#d4af37] transition-colors">Reset Access</Link>
						<Link to="/privacy-policy" className="hover:text-[#d4af37] transition-colors">Privacy</Link>
						<Link to="/terms-of-usage" className="hover:text-[#d4af37] transition-colors">Terms</Link>
					</div>
				</div>

				<div className="mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
					<p className="text-[9px] text-[#fdfcf0]/30 uppercase tracking-[0.2em]">© {new Date().getFullYear()} AMBADY — PILGRIMAGE EXPERIENCES. ALL RIGHTS RESERVED.</p>
					<p className="text-[9px] text-[#d4af37]/40 uppercase tracking-[0.2em] font-bold">Rooted in Tradition</p>
				</div>
			</div>
		</footer>
	);
}
