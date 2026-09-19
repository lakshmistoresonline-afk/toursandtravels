import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { DestinationSpot } from "@workspace/shared/types/spots";
import {
	MoreHorizontal,
	PlusCircle,
	Search,
	MapPin,
	Edit3,
	Trash2,
	Eye,
} from "lucide-react";
import { Form, Link, useLoaderData, useNavigation, useLocation } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { DataTable, DataTableSkeleton, TableColumnsToggle } from "~/components/Table/data-table";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { SpotsService } from "@workspace/shared/services/spots.service";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export const clientLoader = async ({ request }: any) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const page = Number(url.searchParams.get("page") || "0");
	const pageSize = Number(url.searchParams.get("pageSize") || "20");
	const svc = new SpotsService();

	let filteredSpots: DestinationSpot[] = [];
	let total = 0;

	if (q) {
		const searchResults = await svc.searchSpots(q);
		filteredSpots = searchResults;
		total = searchResults.length;
	} else {
		const data = await svc.listSpots(pageSize, null); // For now, simple list
		filteredSpots = data.spots;
		total = data.total;
	}

	return { spots: filteredSpots, query: q, total, page, pageSize };
};

export const clientAction = async ({ request }: any) => {
	const formData = await request.formData();
	const intent = formData.get("intent");
	const spotId = formData.get("spotId") as string;
	const svc = new SpotsService();

	if (intent === "verify") {
		const { user } = await getCurrentUser(request);
		await svc.verifySpot(spotId, user?.uid || "admin");
		return { success: true, message: "Spot verified successfully!" };
	}

	if (intent === "publish") {
		await svc.publishSpot(spotId);
		return { success: true, message: "Spot published to master inventory!" };
	}

	if (intent === "archive") {
		await svc.archiveSpot(spotId);
		return { success: true, message: "Spot archived." };
	}

	return null;
};

export default function AdminDestinationsPage() {
	const { spots, query, total, pageSize } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const location = useLocation();

	const isFetching =
		navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const columns: ColumnDef<DestinationSpot, unknown>[] = [
		{
			id: "Name",
			accessorKey: "canonicalName",
			header: "Canonical Name",
			cell: ({ row }) => (
				<div className="flex flex-col gap-0.5">
					<span className="font-bold text-foreground leading-tight">
						{row.original.canonicalName}
					</span>
					{row.original.aliases?.length > 0 && (
						<span className="text-[9px] text-foreground/40 font-medium italic">
							Also: {row.original.aliases.join(", ")}
						</span>
					)}
				</div>
			),
		},
		{
			id: "Category",
			header: "Category & Domain",
			cell: ({ row }) => (
				<div className="flex flex-wrap gap-1.5">
					{row.original.domains.map((domain) => (
						<Badge
							key={domain}
							variant="outline"
							className="text-[8px] font-bold uppercase tracking-widest bg-primary/5 border-primary/20 text-primary"
						>
							{domain}
						</Badge>
					))}
					<Badge className="text-[8px] font-bold uppercase tracking-widest bg-foreground/5 text-foreground/60 border-none shadow-none">
						{row.original.category}
					</Badge>
				</div>
			),
		},
		{
			id: "Location",
			header: "Hierarchy",
			cell: ({ row }) => (
				<div className="flex items-center gap-2 text-foreground/60">
					<MapPin className="h-3.5 w-3.5 text-primary/50" />
					<div className="flex flex-col">
						<span className="text-[10px] font-bold uppercase tracking-wider">
							{row.original.geography.stateUT}
						</span>
						<span className="text-[9px] text-foreground/40">
							{row.original.geography.district} › {row.original.geography.cityLocality}
						</span>
					</div>
				</div>
			),
		},
		{
			id: "Verification",
			accessorKey: "verification.status",
			header: "Verification",
			cell: (info) => {
				const status = info.getValue() as string;
				const variants: any = {
					PUBLISHED: "text-emerald-600 border-emerald-600/20 bg-emerald-50",
					VERIFIED: "text-blue-600 border-blue-600/20 bg-blue-50",
					DISCOVERED: "text-amber-600 border-amber-600/20 bg-amber-50",
					ARCHIVED: "text-slate-500 border-slate-500/20 bg-slate-50",
				};
				return (
					<Badge
						className={`px-3 py-1 rounded-full border shadow-none font-bold text-[9px] uppercase tracking-widest ${variants[status] || ""}`}
					>
						{status?.replace("_", " ")}
					</Badge>
				);
			},
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-10 w-10 p-0 rounded-full hover:bg-primary/5">
							<MoreHorizontal className="h-5 w-5 text-foreground/40" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-52 rounded-2xl p-2 shadow-2xl bg-white border border-primary/10"
					>
						<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5">
							<Eye className="mr-3 h-4.5 w-4.5 opacity-60 text-primary" /> View Details
						</DropdownMenuItem>
						<Link to={`edit/${row.original.spotId}`}>
							<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5">
								<Edit3 className="mr-3 h-4.5 w-4.5 opacity-60 text-primary" /> Edit Spot
							</DropdownMenuItem>
						</Link>
						<DropdownMenuSeparator className="bg-primary/5 mx-1" />
						<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-red-600 focus:bg-red-50">
							<Trash2 className="mr-3 h-4.5 w-4.5" /> Archive Spot
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const table = useReactTable({
		data: spots ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
			<MetaDetails
				metaTitle="Destination Master | AMBADY Admin"
				metaDescription="Manage the master inventory of discoverable spots in India."
			/>

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-8">
				<div>
					<h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">
						Destination Master
					</h1>
					<p className="text-foreground/40 mt-3 text-sm uppercase tracking-[0.2em] font-bold">
						Canonical inventory of sacred and tourist spots.
					</p>
				</div>
				<Button
					asChild
					className="rounded-full px-10 h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:scale-105 transition-all"
				>
					<Link to="add">
						<PlusCircle className="mr-3 h-5 w-5" /> Add Master Spot
					</Link>
				</Button>
			</div>

			<div className="bg-card rounded-[2.5rem] overflow-hidden shadow-xl border border-primary/10">
				<div className="p-0">
					<div className="p-8 border-b border-primary/10 flex flex-col md:flex-row justify-between gap-8 items-center bg-primary/5">
						<Form method="get" className="relative w-full md:w-[450px]">
							<Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
							<Input
								name="q"
								placeholder="Search by name, alias, city or state..."
								className="h-14 pl-14 rounded-2xl bg-white border-primary/20 text-foreground focus-visible:ring-primary/20 placeholder:text-foreground/30 shadow-sm"
								defaultValue={query}
							/>
						</Form>
						<TableColumnsToggle table={table} />
					</div>

					{isFetching ? (
						<div className="p-12">
							<DataTableSkeleton noOfSkeletons={10} columns={columns} />
						</div>
					) : (
						<div className="bg-card">
							<DataTable
								table={table}
								total={total}
								pageSize={pageSize}
								onPageChange={() => {}}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
