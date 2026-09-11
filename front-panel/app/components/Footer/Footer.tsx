import { Link } from "react-router";

export default function Footer() {
	return (
		<footer className="bg-background border-t border-primary/10 py-16 mt-20 relative z-10">
			<div className="container mx-auto px-6">
				<div className="flex flex-col md:flex-row justify-between items-center gap-12">
					<div className="flex flex-col items-center md:items-start gap-4">
						<div className="flex items-center gap-3">
							<span className="text-2xl font-display font-bold tracking-widest text-primary">
								AMBADY
							</span>
						</div>
						<p className="text-[10px] text-foreground/40 uppercase tracking-[0.4em] font-bold">
							Faith | Heritage | Inner Journeys
						</p>
					</div>

					<div className="flex flex-wrap justify-center gap-x-12 gap-y-6 text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/60">
						<Link to="/about" className="hover:text-primary transition-colors">
							About
						</Link>
						<Link to="/contact-us" className="hover:text-primary transition-colors">
							Contact
						</Link>
						<Link
							to="/forgot-password"
							title="Reset Access"
							className="hover:text-primary transition-colors"
						>
							Reset Access
						</Link>
						<Link to="/privacy-policy" className="hover:text-primary transition-colors">
							Privacy
						</Link>
						<Link to="/terms-of-usage" className="hover:text-primary transition-colors">
							Terms
						</Link>
					</div>
				</div>

				<div className="mt-16 pt-8 border-t border-primary/5 flex flex-col md:flex-row justify-between items-center gap-6">
					<p className="text-[9px] text-foreground/30 uppercase tracking-[0.2em]">
						© {new Date().getFullYear()} AMBADY — PILGRIMAGE EXPERIENCES. ALL RIGHTS RESERVED.
					</p>
					<p className="text-[9px] text-primary/60 uppercase tracking-[0.2em] font-bold">
						Rooted in Tradition
					</p>
				</div>
			</div>
		</footer>
	);
}
