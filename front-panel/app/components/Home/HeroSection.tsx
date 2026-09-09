import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { Form, useSearchParams } from "react-router";

export default function HeroSection({ hero_sections = [] }: { hero_sections: any[] }) {
	const [searchParams] = useSearchParams();
	let currentQuery = searchParams.get("q") ?? "";

	return (
		<section className="relative h-[60vh] w-full overflow-hidden rounded-xl">
			{/* Background Image */}
			<div className="absolute inset-0">
				<img
					src="/hero-bg.jpg"
					alt="Adventure Background"
					className="h-full w-full object-cover"
				/>
				<div className="absolute inset-0 bg-black/50" />
			</div>

			{/* Content */}
			<div className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center px-4">
				<h1 className="text-white text-4xl md:text-6xl font-bold mb-4">
					Explore The World With Us
				</h1>
				<p className="text-white/80 text-lg md:text-xl mb-8 max-w-2xl">
					Handpicked tours and unique experiences designed just for you.
				</p>

				<Form method="get" action="/tours" className="w-full max-w-xl">
					<div className="flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-lg backdrop-blur-md">
						<Input
							type="text"
							name="q"
							placeholder="Search tours or destinations..."
							className="bg-white text-black h-12"
							defaultValue={currentQuery}
						/>
						<Button className="h-12 px-8" type="submit">
							Search
						</Button>
					</div>
				</Form>
			</div>
		</section>
	);
}
