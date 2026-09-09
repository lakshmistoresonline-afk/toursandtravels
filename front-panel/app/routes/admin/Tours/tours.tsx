import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { HighLevelTour } from "@workspace/shared/types/tours";
import { MoreHorizontal, PlusCircle, Search, MapPin, IndianRupee, Edit3, Trash2, ExternalLink } from "lucide-react";
import { useMemo } from "react";
import {
	Form,
	Link,
	useLoaderData,
	useNavigation,
	useLocation,
} from "react-router";
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
import { ToursService } from "@workspace/shared/services/tours.service";
import { Card, CardContent } from "~/components/ui/card";

export const clientLoader = async ({ request }: any) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const svc = new ToursService();
	const data = await svc.getHighLevelTours(q);
	return { data, query: q };
};

export default function AdminToursPage() {
	const { data, query } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const location = useLocation();

	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const columns: ColumnDef<HighLevelTour, unknown>[] = [
		{
			id: "Tour",
			header: "Tour Details",
			cell: ({ row }) => (
				<div className="flex items-center gap-4">
					<div className="h-12 w-12 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
						<img src={row.original.cover_image || ""} className="h-full w-full object-cover" alt="" />
					</div>
					<div>
						<div className="font-bold text-slate-900">{row.original.name}</div>
						<div className="text-xs font-mono text-slate-500 uppercase tracking-tighter">{row.original.tour_code}</div>
					</div>
				</div>
			)
		},
		{
			id: "Destination",
			accessorKey: "destination",
			header: "Location",
			cell: (info) => (
				<div className="flex items-center gap-1.5 text-slate-600">
					<MapPin className="h-3.5 w-3.5" />
					<span className="text-sm font-medium">{info.getValue() as string}</span>
				</div>
			)
		},
		{
			id: "Price",
			accessorKey: "price",
			header: "Price",
			cell: (info) => (
				<div className="flex items-center font-bold text-slate-900">
					<IndianRupee className="h-3 w-3" />
					<span>{(info.getValue() as number)?.toLocaleString()}</span>
				</div>
			)
		},
		{
			id: "Status",
			accessorKey: "status",
			header: "Status",
			cell: (info) => {
				const status = info.getValue() as string;
				const variants: any = {
					REGISTRATION_OPEN: "bg-green-100 text-green-700 border-green-200",
					PUBLISHED: "bg-blue-100 text-blue-700 border-blue-200",
					REGISTRATION_CLOSED: "bg-red-100 text-red-700 border-red-200",
					DRAFT: "bg-gray-100 text-gray-700 border-gray-200",
				};
				return (
					<Badge className={`px-2 py-0.5 rounded-lg border shadow-none font-bold text-[10px] uppercase ${variants[status] || ""}`}>
						{status?.replace('_', ' ')}
					</Badge>
				);
			}
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-10 w-10 p-0 rounded-xl hover:bg-slate-100"><MoreHorizontal className="h-5 w-5 text-slate-400" /></Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-xl border-slate-100">
						<Link to={`edit/${row.original.id}`}>
							<DropdownMenuItem className="rounded-xl cursor-pointer py-2.5">
								<Edit3 className="mr-2 h-4 w-4" /> Edit Details
							</DropdownMenuItem>
						</Link>
						<a href={`/tours/tour/${row.original.id}`} target="_blank">
							<DropdownMenuItem className="rounded-xl cursor-pointer py-2.5">
								<ExternalLink className="mr-2 h-4 w-4" /> Preview Live
							</DropdownMenuItem>
						</a>
						<DropdownMenuSeparator />
						<DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 text-red-600 focus:text-red-600 focus:bg-red-50">
							<Trash2 className="mr-2 h-4 w-4" /> Delete Tour
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		}
	];

	const table = useReactTable({
		data: data.tours ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="flex flex-col gap-8 animate-in fade-in duration-500">
			<MetaDetails metaTitle="Manage Inventory | WanderNest Admin" />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				<div>
					<h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Tour Inventory</h1>
					<p className="text-slate-500 mt-2 text-lg">Manage and track all initiated experiences.</p>
				</div>
				<Button asChild size="lg" className="rounded-2xl px-8 shadow-lg shadow-primary/20">
					<Link to="add"><PlusCircle className="mr-2 h-5 w-5" /> Initiate New Tour</Link>
				</Button>
			</div>

			<Card className="border-none shadow-sm rounded-3xl overflow-hidden bg-white">
				<CardContent className="p-0">
					<div className="p-6 border-b border-slate-50 flex flex-col md:flex-row justify-between gap-4 items-center">
						<Form method="get" className="relative w-full md:w-96">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
							<Input name="q" placeholder="Search by name or code..." className="h-12 pl-12 rounded-2xl bg-slate-50 border-none focus-visible:ring-primary/20" defaultValue={query} />
						</Form>
						<TableColumnsToggle table={table} />
					</div>

					{isFetching ? (
						<div className="p-6"><DataTableSkeleton noOfSkeletons={5} columns={columns} /></div>
					) : (
						<DataTable table={table} total={data.total} pageSize={10} onPageChange={() => {}} />
					)}
				</CardContent>
			</Card>
		</div>
	);
}
