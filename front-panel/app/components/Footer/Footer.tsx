import { Link } from "react-router";
import { Heart } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t border-[#d4af37]/10 bg-[#0a0e1a] mt-20">
			<div className="container mx-auto py-12 px-4">
				<div className="flex flex-col md:flex-row items-center justify-between gap-8">
					<div className="flex items-center gap-3">
						<span className="text-xl font-display font-bold tracking-widest text-[#d4af37]">AMBADY</span>
					</div>

					<div className="flex gap-8 text-[9px] font-bold uppercase tracking-[0.2em] text-[#fdfcf0]/40">
						<Link to="/about" className="hover:text-[#d4af37] transition-colors">About</Link>
						<Link to="/contact-us" className="hover:text-[#d4af37] transition-colors">Contact</Link>
						<Link to="/privacy-policy" className="hover:text-[#d4af37] transition-colors">Privacy</Link>
						<Link to="/terms-of-usage" className="hover:text-[#d4af37] transition-colors">Terms</Link>
					</div>

					<p className="text-[9px] font-bold uppercase tracking-[0.2em] text-[#fdfcf0]/20">
						© {new Date().getFullYear()} AMBADY
					</p>
				</div>
			</div>
		</footer>
	);
}
