import { MetaDetails } from "~/components/SEO/MetaDetails";

export const clientLoader = () => {
	return null;
};

export default function About() {
	return (
		<div className="min-h-screen animate-in fade-in duration-1000">
			<MetaDetails
				metaTitle="Our Story | AMBADY"
				metaDescription="Learn about AMBADY PILGRIMAGE EXPERIENCES - your trusted partner for sacred and meaningful pilgrimage journeys."
				metaKeywords="About us, AMBADY PILGRIMAGE EXPERIENCES, pilgrimage journeys, faith, heritage"
			/>

			<div className="pt-32 pb-20 relative overflow-hidden">
				{/* Background Artwork */}
				<div className="absolute inset-0 z-0">
					<img
						src="/brand/ambady-background.png"
						alt=""
						className="w-full h-full object-cover object-top opacity-30"
					/>
					<div className="absolute inset-0 bg-gradient-to-b from-[#0a0e1a]/80 via-transparent to-[#0a0e1a]" />
				</div>

				<div className="container mx-auto px-6 max-w-5xl space-y-16 relative z-10">
					<div className="text-center space-y-4">
						<h4 className="text-[10px] font-bold uppercase tracking-[0.6em] text-[#d4af37]">The Essence</h4>
						<h1 className="text-5xl md:text-7xl font-serif text-[#fdfcf0] tracking-tight">Our Sacred Story</h1>
					</div>

					<div className="surface-card p-12 md:p-20 rounded-[3rem] border-[#d4af37]/20 space-y-12 shadow-2xl">
						<div className="space-y-8 text-[#fdfcf0]/80 font-sans font-light leading-relaxed text-lg md:text-xl text-center md:text-left">
							<p className="first-letter:text-5xl first-letter:font-serif first-letter:text-[#d4af37] first-letter:mr-3 first-letter:float-left">
								AMBADY was born from a profound realization: that travel, at its highest form, is a spiritual endeavor. We believe that every journey should be more than just a change of scenery—it should be a path to inner peace, a connection to our heritage, and a strengthening of faith.
							</p>

							<p>
								For years, we have dedicated ourselves to crafting experiences that honor the sacred traditions of the lands we visit. Our pilgrimage journeys are meticulously designed to provide not just comfort and ease, but the space and silence necessary for true spiritual reflection.
							</p>

							<p>
								From the ancient temples that have stood for millennia to the quiet moments of devotion in nature, we invite you to join us on a journey that transcends the physical. With AMBADY, the pilgrimage begins the moment you decide to seek the divine within.
							</p>
						</div>

						<div className="pt-12 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
							<div className="space-y-2">
								<p className="text-3xl font-serif text-[#d4af37]">Faith</p>
								<p className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/60">Our Foundation</p>
							</div>
							<div className="space-y-2">
								<p className="text-3xl font-serif text-[#d4af37]">Heritage</p>
								<p className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/60">Our Identity</p>
							</div>
							<div className="space-y-2">
								<p className="text-3xl font-serif text-[#d4af37]">Inner Journeys</p>
								<p className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/60">Our Mission</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
