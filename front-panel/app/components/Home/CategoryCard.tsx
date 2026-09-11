import { Link } from "react-router";
import { memo, useState } from "react";
import { Compass } from "lucide-react";

import type { FPHighLevelCategory } from "@workspace/shared/types/categories";

export const CategoryCard = memo(({ category, ...props }: { category: FPHighLevelCategory }) => {
	const [imgError, setImgError] = useState(false);
	const hasImage = !imgError && category.image && category.image.startsWith("http");

	return (
		<Link
			to={`/tours?categories=${category.id}`}
			prefetch="intent"
			viewTransition
			className="group block h-full"
		>
			<div className="select-none relative aspect-4/3 overflow-hidden rounded-2xl border bg-[#0a0e1a] flex items-center justify-center" {...props}>
				{hasImage ? (
					<img
						src={ category.image}
						alt={category.name}
						onError={() => setImgError(true)}
						className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[104%]"
					/>
				) : (
					<Compass className="h-10 w-10 text-[#d4af37] opacity-20" />
				)}
				<div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/30 to-transparent" />

				<div className="absolute bottom-0 left-0 right-0 p-4">
					<h3 className="sm:text-md md:text-lg font-semibold text-white leading-tight">
						{category.name}
					</h3>
				</div>
			</div>
		</Link>
	);
});
