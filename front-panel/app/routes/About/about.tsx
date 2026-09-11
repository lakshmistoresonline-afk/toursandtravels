import { MetaDetails } from "~/components/SEO/MetaDetails";

export const clientLoader = () => {
	return null;
};

export default function About() {
	return (
		<div className="min-h-screen bg-background animate-in fade-in duration-1000">
			<MetaDetails
				metaTitle="Our Story | AMBADY"
				metaDescription="Learn about AMBADY PILGRIMAGE EXPERIENCES - your trusted partner for sacred and meaningful pilgrimage journeys."
				metaKeywords="About us, AMBADY PILGRIMAGE EXPERIENCES, pilgrimage journeys, faith, heritage"
			/>

			<div className="pt-32 pb-24 relative overflow-hidden">
				<div className="container mx-auto px-6 max-w-5xl space-y-20 relative z-10">
					<div className="text-center space-y-6">
						<h4 className="text-[11px] font-bold uppercase tracking-[0.6em] text-primary">
							The Essence
						</h4>
						<h1 className="text-5xl md:text-7xl font-serif text-foreground tracking-tight leading-tight">
							Our Sacred Story
						</h1>
						<div className="w-24 h-1 bg-primary mx-auto rounded-full" />
					</div>

					<div className="bg-card p-12 md:p-24 rounded-[3rem] border border-primary/10 space-y-16 shadow-xl">
						<div className="space-y-10 text-foreground/70 font-sans leading-relaxed text-lg md:text-xl text-justify">
							<p className="first-letter:text-6xl first-letter:font-serif first-letter:text-primary first-letter:mr-4 first-letter:float-left first-letter:mt-1">
								AMBADY was born from a profound realization: that travel, at its highest form,
								is a spiritual endeavor. We believe that every journey should be more than
								just a change of scenery—it should be a path to inner peace, a connection to
								our heritage, and a strengthening of faith.
							</p>

							<p>
								For years, we have dedicated ourselves to crafting experiences that honor the
								sacred traditions of the lands we visit. Our pilgrimage journeys are
								meticulously designed to provide not just comfort and ease, but the space and
								silence necessary for true spiritual reflection.
							</p>

							<p>
								From the ancient temples that have stood for millennia to the quiet moments of
								devotion in nature, we invite you to join us on a journey that transcends the
								physical. With AMBADY, the pilgrimage begins the moment you decide to seek the
								divine within.
							</p>
						</div>

						<div className="pt-16 border-t border-primary/10 grid grid-cols-1 md:grid-cols-3 gap-16 text-center">
							<div className="space-y-3 group">
								<p className="text-4xl font-serif text-primary transition-transform group-hover:scale-110">
									Faith
								</p>
								<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
									Our Foundation
								</p>
							</div>
							<div className="space-y-3 group">
								<p className="text-4xl font-serif text-primary transition-transform group-hover:scale-110">
									Heritage
								</p>
								<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
									Our Identity
								</p>
							</div>
							<div className="space-y-3 group">
								<p className="text-4xl font-serif text-primary transition-transform group-hover:scale-110">
									Inner Journeys
								</p>
								<p className="text-[10px] font-bold uppercase tracking-[0.2em] text-foreground/40">
									Our Mission
								</p>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
