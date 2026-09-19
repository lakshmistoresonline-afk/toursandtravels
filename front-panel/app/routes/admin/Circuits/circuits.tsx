import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { Circuit } from "@workspace/shared/types/circuits";
import {
	MoreHorizontal,
	PlusCircle,
	Search,
} from "lucide-react";
import { Form, Link, useLoaderData, useNavigation, useLocation } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { DataTable, DataTableSkeleton } from "~/components/Table/data-table";
import { Button } from "~/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { CircuitsService } from "@workspace/shared/services/circuits.service";

export const clientLoader = async () => {
	const svc = new CircuitsService();
	const data = await svc.listCircuits();
	return { circuits: data.circuits, total: data.total };
};

export default function AdminCircuitsPage() {
	const { circuits, total } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const location = useLocation();

	const isFetching =
		navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const columns: ColumnDef<Circuit, unknown>[] = [
		{
			id: "Name",
			accessorKey: "name",
			header: "Circuit Name",
			cell: ({ row }) => (
				<div className="flex flex-col gap-0.5">
					<span className="font-bold text-foreground">
						{row.original.name}
					</span>
					{row.original.description && (
						<span className="text-[10px] text-foreground/40 line-clamp-1">
							{row.original.description}
						</span>
					)}
				</div>
			),
		},
		{
			id: "Domain",
			accessorKey: "domain",
			header: "Domain",
			cell: (info) => (
				<Badge variant="outline" className="text-[9px] font-bold uppercase tracking-widest bg-primary/5 text-primary">
					{info.getValue() as string}
				</Badge>
			),
		},
		{
			id: "Stops",
			header: "Stop Count",
			cell: ({ row }) => (
				<div className="text-center font-bold text-primary">
					{row.original.spotIds?.length || 0}
				</div>
			),
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
					<DropdownMenuContent align="end" className="w-52 rounded-2xl p-2 shadow-2xl bg-white border border-primary/10">
						<Link to={`edit/${row.original.id}`}>
							<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5">
								Edit Circuit
							</DropdownMenuItem>
						</Link>
						<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5">
							Generate Journey
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const table = useReactTable({
		data: circuits ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
			<MetaDetails
				metaTitle="Circuit Master | AMBADY Admin"
				metaDescription="Manage spiritual and tourist circuits."
			/>

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-8">
				<div>
					<h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">
						Circuit Master
					</h1>
					<p className="text-foreground/40 mt-3 text-sm uppercase tracking-[0.2em] font-bold">
						Reusable spiritual paths and tour routes.
					</p>
				</div>
				<Button
					asChild
					className="rounded-full px-10 h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:scale-[1.05] transition-all"
				>
					<Link to="add">
						<PlusCircle className="mr-3 h-5 w-5" /> Add Master Circuit
					</Link>
				</Button>
			</div>

			<div className="bg-card rounded-[2.5rem] overflow-hidden shadow-xl border border-primary/10">
				<div className="p-8 border-b border-primary/10 flex flex-col md:flex-row justify-between gap-8 items-center bg-primary/5">
					<Form method="get" className="relative w-full md:w-[450px]">
						<Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
						<Input
							name="q"
							placeholder="Search by circuit name..."
							className="h-14 pl-14 rounded-2xl bg-white border-primary/20 text-foreground focus-visible:ring-primary/20 placeholder:text-foreground/30 shadow-sm"
						/>
					</Form>
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
							pageSize={10}
							onPageChange={() => {}}
						/>
					</div>
				)}
			</div>
		</div>
	);
}
