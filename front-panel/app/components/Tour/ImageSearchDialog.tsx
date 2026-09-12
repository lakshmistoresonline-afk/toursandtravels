import { useState, useEffect } from "react";
import { Search, Loader2, Image as ImageIcon, Check } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
} from "~/components/ui/dialog";
import { toast } from "sonner";

interface ImageSearchDialogProps {
	isOpen: boolean;
	onOpenChange: (open: boolean) => void;
	onSelect: (data: { url: string; attribution?: { photographer_name: string; photographer_url: string } }) => void;
	currentValue?: string;
	initialQuery?: string;
}

export function ImageSearchDialog({
	isOpen,
	onOpenChange,
	onSelect,
	currentValue,
	initialQuery,
}: ImageSearchDialogProps) {
	const [query, setQuery] = useState(initialQuery || "");
	const [images, setImages] = useState<any[]>([]);
	const [isLoading, setIsLoading] = useState(false);
	const [accessKey, setAccessKey] = useState<string | null>(null);

	useEffect(() => {
		// @ts-ignore
		setAccessKey(import.meta.env.VITE_UNSPLASH_ACCESS_KEY);
	}, []);

	useEffect(() => {
		if (isOpen && initialQuery && !images.length) {
			setQuery(initialQuery);
			handleSearch();
		}
	}, [isOpen, initialQuery]);

	const handleSearch = async (e?: React.FormEvent) => {
		if (e) e.preventDefault();
		if (!query.trim()) return;

		if (!accessKey) {
			toast.error("Unsplash Access Key not configured. Please add VITE_UNSPLASH_ACCESS_KEY to your .env file.");
			return;
		}

		setIsLoading(true);
		try {
			const response = await fetch(
				`https://api.unsplash.com/search/photos?query=${encodeURIComponent(
					query
				)}&per_page=12&client_id=${accessKey}`
			);
			const data = await response.json();
			if (data.results) {
				setImages(data.results);
			} else {
				setImages([]);
				toast.error("Failed to fetch images from Unsplash.");
			}
		} catch (error) {
			console.error("Unsplash search error:", error);
			toast.error("An error occurred while searching for images.");
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<Dialog open={isOpen} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-3xl bg-white border-primary/10 text-foreground shadow-2xl rounded-[3rem] p-0 overflow-hidden max-h-[90vh] flex flex-col">
				<DialogHeader className="p-10 bg-primary/5 border-b border-primary/10 shrink-0">
					<DialogTitle className="text-3xl font-serif text-foreground">
						Spiritual Image Search
					</DialogTitle>
					<DialogDescription className="text-primary text-[10px] font-bold uppercase tracking-[0.3em] mt-3">
						Find high-quality sacred imagery from Unsplash.
					</DialogDescription>
				</DialogHeader>

				<div className="p-8 space-y-8 flex-1 overflow-y-auto">
					<form onSubmit={handleSearch} className="flex gap-4">
						<div className="relative flex-1">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
							<Input
								placeholder="e.g. Kedarnath, Varanasi, Temple..."
								value={query}
								onChange={(e) => setQuery(e.target.value)}
								className="h-14 pl-12 rounded-2xl border-primary/20 bg-white text-foreground focus-visible:ring-primary/20 shadow-sm"
							/>
						</div>
						<Button
							type="submit"
							disabled={isLoading}
							className="h-14 rounded-2xl bg-primary text-primary-foreground px-8 font-bold uppercase tracking-widest text-[10px]"
						>
							{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Search"}
						</Button>
					</form>

					{isLoading ? (
						<div className="py-20 text-center">
							<Loader2 className="h-10 w-10 text-primary animate-spin mx-auto opacity-20" />
						</div>
					) : images.length > 0 ? (
						<div className="grid grid-cols-2 md:grid-cols-3 gap-6">
							{images.map((img) => (
								<div
									key={img.id}
									className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-primary/10 hover:border-primary transition-all shadow-sm"
								>
									<img
										src={img.urls.small}
										alt={img.alt_description}
										className="w-full h-full object-cover transition-transform group-hover:scale-105"
									/>
									<div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
										<Button
											type="button"
											variant="secondary"
											size="sm"
											onClick={() => {
												onSelect({
													url: img.urls.regular,
													attribution: {
														photographer_name: img.user.name,
														photographer_url: img.user.links.html,
													},
												});
												onOpenChange(false);
											}}
											className="rounded-full bg-white text-primary font-bold uppercase tracking-widest text-[8px] px-4"
										>
											Select Image
										</Button>
										<div className="text-center px-4">
											<p className="text-[8px] text-white/60 font-medium truncate w-full">
												Photo by{" "}
												<a
													href={`${img.user.links.html}?utm_source=ambady_pilgrimage&utm_medium=referral`}
													target="_blank"
													rel="noopener noreferrer"
													className="underline hover:text-white"
												>
													{img.user.name}
												</a>
											</p>
											<p className="text-[7px] text-white/40 font-bold uppercase tracking-tighter">
												on{" "}
												<a
													href="https://unsplash.com/?utm_source=ambady_pilgrimage&utm_medium=referral"
													target="_blank"
													rel="noopener noreferrer"
													className="underline hover:text-white"
												>
													Unsplash
												</a>
											</p>
										</div>
									</div>
									{currentValue === img.urls.regular && (
										<div className="absolute top-2 right-2 bg-primary text-primary-foreground p-1 rounded-full shadow-lg z-10">
											<Check className="h-3 w-3" />
										</div>
									)}
								</div>
							))}
						</div>
					) : (
						<div className="py-20 text-center space-y-4 opacity-20">
							<ImageIcon className="h-12 w-12 mx-auto" />
							<p className="text-[10px] font-bold uppercase tracking-widest">
								Search for sacred destinations to see suggestions.
							</p>
						</div>
					)}
				</div>
				<div className="p-6 bg-primary/5 border-t border-primary/10 text-[9px] text-center text-foreground/40 font-bold uppercase tracking-widest">
					Images provided by Unsplash API
				</div>
			</DialogContent>
		</Dialog>
	);
}
