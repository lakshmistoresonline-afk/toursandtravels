import type { FPHighLevelCity } from "@workspace/shared/types/cities";
import { memo, useState } from "react";
import { Link } from "react-router";
import { MapPin } from "lucide-react";

export const CityCard = memo(({ city }: { city: FPHighLevelCity }) => {
	const [imgError, setImgError] = useState(false);
	const hasImage = !imgError && city.card_image && city.card_image.startsWith("http");

	return (
		<Link to={`/city/${city.id}/${city.url_key}`} prefetch="intent" viewTransition>
			<div className="select-none h-88 flex flex-col max-w-60 rounded-xl shadow-lg overflow-hidden relative group bg-[#0a0e1a]">
				<div className="relative w-full h-full flex items-center justify-center">
					{hasImage ? (
						<img
							src={ city.card_image}
							alt={city.name}
							onError={() => setImgError(true)}
							className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-[104%]"
						/>
					) : (
						<MapPin className="h-12 w-12 text-[#d4af37] opacity-20" />
					)}
					<div className="absolute bottom-3 left-3">
						<div className="inset-0 bg-black/80 bg-opacity-30 px-2 py-1 rounded-sm">
							<h3 className="font-bold text-lg text-secondary line-clamp-1">{city.name}</h3>
						</div>
					</div>
				</div>
			</div>
		</Link>
	);
});
