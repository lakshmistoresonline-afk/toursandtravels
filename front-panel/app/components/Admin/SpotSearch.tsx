import { useState, useEffect } from "react";
import { Check, ChevronsUpDown, MapPin } from "lucide-react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "~/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "~/components/ui/popover";
import { SpotsService } from "@workspace/shared/services/spots.service";
import type { DestinationSpot } from "@workspace/shared/types/spots";
import { Badge } from "~/components/ui/badge";

interface SpotSearchProps {
	onSelect: (spot: DestinationSpot) => void;
	placeholder?: string;
	className?: string;
	defaultValue?: string;
}

export function SpotSearch({ onSelect, placeholder = "Search master spots...", className, defaultValue }: SpotSearchProps) {
	const [open, setOpen] = useState(false);
	const [value, setValue] = useState(defaultValue || "");
	const [spots, setSpots] = useState<DestinationSpot[]>([]);
	const [searchQuery, setSearchQuery] = useState("");

	useEffect(() => {
		const init = async () => {
			const svc = new SpotsService();
			if (defaultValue && !value) {
				const spot = await svc.getSpotById(defaultValue);
				if (spot) {
					setSpots(prev => [spot, ...prev]);
					setValue(defaultValue);
				}
			}
		};
		init();
	}, [defaultValue, value]);

	useEffect(() => {
		const search = async () => {
			if (!searchQuery) {
				const svc = new SpotsService();
				const resp = await svc.listSpots(20);
				setSpots(resp.spots);
				return;
			}

			const timeout = setTimeout(async () => {
				try {
					const svc = new SpotsService();
					const results = await svc.searchSpots(searchQuery);
					setSpots(results);
				} catch (err) {
					console.error("Search failed", err);
				}
			}, 300);

			return () => clearTimeout(timeout);
		};
		search();
	}, [searchQuery]);

	const filteredSpots = spots;

	return (
		<Popover open={open} onOpenChange={setOpen}>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					role="combobox"
					aria-expanded={open}
					className={cn("w-full justify-between h-14 rounded-2xl border-primary/20 bg-white text-foreground hover:bg-primary/5 px-6 font-medium shadow-sm", className)}
				>
					{value
						? spots.find((spot) => spot.spotId === value)?.canonicalName || "Select spot..."
						: placeholder}
					<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[400px] p-0 rounded-2xl shadow-2xl border-primary/10 overflow-hidden bg-white">
				<Command shouldFilter={false}>
					<CommandInput
						placeholder="Search by name or city..."
						value={searchQuery}
						onValueChange={setSearchQuery}
						className="h-12 border-none focus:ring-0"
					/>
					<CommandList className="max-h-[300px]">
						<CommandEmpty>No spots found.</CommandEmpty>
						<CommandGroup>
							{filteredSpots.map((spot) => (
								<CommandItem
									key={spot.spotId}
									value={spot.spotId}
									onSelect={(currentValue) => {
										setValue(currentValue === value ? "" : currentValue);
										onSelect(spot);
										setOpen(false);
									}}
									className="p-4 cursor-pointer hover:bg-primary/5 transition-colors"
								>
									<Check
										className={cn(
											"mr-3 h-4 w-4 text-primary",
											value === spot.spotId ? "opacity-100" : "opacity-0"
										)}
									/>
									<div className="flex flex-col gap-0.5 flex-1">
										<div className="flex items-center justify-between">
											<span className="font-bold text-sm">{spot.canonicalName}</span>
											<Badge variant="outline" className="text-[7px] uppercase tracking-tighter bg-primary/5 border-primary/10 text-primary">
												{spot.category}
											</Badge>
										</div>
										<div className="flex items-center gap-1.5 text-foreground/40">
											<MapPin className="h-2.5 w-2.5" />
											<span className="text-[10px] font-medium uppercase tracking-wider">
												{spot.geography.cityLocality}, {spot.geography.stateUT}
											</span>
										</div>
									</div>
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
