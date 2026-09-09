import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, useSearchParams } from "react-router";
import { Search, MapPin } from "lucide-react";

export default function HeroSection({ hero_sections = [] }: { hero_sections: any[] }) {
	const [searchParams] = useSearchParams();
	let currentQuery = searchParams.get("q") ?? "";

	return (
		<section className="relative h-[85vh] w-full overflow-hidden flex items-center justify-center">
			{/* High-quality background image or overlay */}
			<div className="absolute inset-0">
				<img
					src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
					alt="Scenic Landscape"
					className="h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-transparent" />
			</div>

			{/* Floating Content */}
			<div className="relative z-20 container mx-auto px-4 text-center text-white space-y-8">
				<div className="space-y-4 max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
					<h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight">
						Your Journey, <br />
						<span className="text-primary italic">Perfectly Planned.</span>
					</h1>
					<p className="text-lg md:text-2xl text-white/90 font-medium">
						Discover the world's most breathtaking destinations and book unique tours in seconds.
					</p>
				</div>

				{/* Search Bar Container */}
				<div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
					<Form method="get" action="/tours">
						<div className="flex flex-col sm:flex-row gap-3 bg-white/20 p-3 rounded-2xl backdrop-blur-xl border border-white/30 shadow-2xl">
							<div className="flex-1 relative">
								<Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 h-5 w-5" />
								<Input
									type="text"
									name="q"
									placeholder="Search for tours, cities or activities..."
									className="bg-transparent! border-none! text-white placeholder:text-white/60 h-14 pl-12 text-lg focus-visible:ring-0!"
									defaultValue={currentQuery}
								/>
							</div>
							<Button className="h-14 px-10 rounded-xl text-lg font-bold shadow-lg hover:scale-105 transition-transform" type="submit">
								Explore Now
							</Button>
						</div>
					</Form>

					{/* Popular Tags */}
					<div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-sm text-white/80">
						<span className="font-semibold">Popular:</span>
						{['Kerala', 'Goa', 'Rajasthan', 'Himalayas'].map(tag => (
							<a key={tag} href={`/tours?q=${tag}`} className="flex items-center gap-1 hover:text-white transition-colors bg-white/10 px-3 py-1 rounded-full border border-white/10">
								<MapPin className="h-3 w-3" /> {tag}
							</a>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
