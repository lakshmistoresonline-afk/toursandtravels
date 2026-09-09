import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, useSearchParams } from "react-router";
import { Search, MapPin } from "lucide-react";

export default function HeroSection({ hero_sections = [] }: { hero_sections: any[] }) {
	const [searchParams] = useSearchParams();
	let currentQuery = searchParams.get("q") ?? "";

	return (
		<section className="relative h-[90vh] w-full overflow-hidden flex items-center justify-center">
			{/* High-quality background image based on user brand */}
			<div className="absolute inset-0">
				<img
					src="/ambady-logo.png"
					alt="Ambady Pilgrimage Experiences"
					className="h-full w-full object-cover blur-[2px] scale-105 opacity-90"
				/>
				<div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/30 to-black/80" />
			</div>

			{/* Floating Content */}
			<div className="relative z-20 container mx-auto px-4 text-center text-white space-y-10">
				<div className="space-y-6 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700">
					<div className="mx-auto w-32 h-32 rounded-full border-4 border-white/20 shadow-2xl overflow-hidden mb-4 hover:scale-110 transition-transform duration-500 bg-white">
						<img src="/ambady-logo.png" alt="Logo" className="w-full h-full object-contain p-2" />
					</div>
					<h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-tight uppercase">
						Ambady <br />
						<span className="text-primary italic font-serif lowercase tracking-normal">Tours & Travels</span>
					</h1>
					<p className="text-xl md:text-3xl text-white/90 font-bold tracking-wide italic">
						"Pilgrimage Begins Here"
					</p>
					<p className="text-lg md:text-xl text-white/70 font-medium max-w-2xl mx-auto">
						Sacred Destinations. Meaningful Journeys. Faith | Heritage | Inner Journeys.
					</p>
				</div>

				{/* Search Bar Container */}
				<div className="w-full max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
					<Form method="get" action="/tours">
						<div className="flex flex-col sm:flex-row gap-3 bg-white/10 p-3 rounded-[2rem] backdrop-blur-2xl border border-white/20 shadow-2xl shadow-black/50">
							<div className="flex-1 relative">
								<Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/70 h-6 w-6" />
								<Input
									type="text"
									name="q"
									placeholder="Search sacred destinations..."
									className="bg-transparent! border-none! text-white placeholder:text-white/40 h-16 pl-14 text-xl font-bold focus-visible:ring-0!"
									defaultValue={currentQuery}
								/>
							</div>
							<Button className="h-16 px-12 rounded-[1.5rem] text-xl font-black shadow-xl hover:scale-[1.02] transition-transform bg-primary text-white" type="submit">
								Start Journey
							</Button>
						</div>
					</Form>
				</div>
			</div>
		</section>
	);
}
