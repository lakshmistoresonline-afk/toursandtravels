import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { HighLevelTour } from "@workspace/shared/types/tours";
import { MoreHorizontal, PlusCircle, Search } from "lucide-react";
import { useEffect, useState } from "react";
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
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Badge } from "~/components/ui/badge";
import { ToursService } from "@workspace/shared/services/tours.service";

export const clientLoader = async ({ request }: any) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const svc = new ToursService();
	const data = await svc.getHighLevelTours(q);
	return { data, query: q };
};

export default function AdminToursPage() {
	const { data, query } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const location = useLocation();

	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const columns: ColumnDef<HighLevelTour, unknown>[] = [
		{
			id: "Code",
			accessorKey: "tour_code",
			header: "Code",
			cell: (info) => <Badge variant="outline" className="font-mono">{info.row.original.tour_code}</Badge>
		},
		{
			id: "Name",
			accessorKey: "name",
			header: "Name",
			cell: (info) => <span className="font-medium">{info.row.original.name}</span>
		},
		{
			id: "Price",
			accessorKey: "price",
			header: "Price (INR)",
			cell: (info) => <span>{info.row.original.price?.toLocaleString()}</span>
		},
		{
			id: "Status",
			accessorKey: "status",
			header: "Status",
			cell: (info) => (
				<Badge variant={info.row.original.status === 'PUBLISHED' ? 'secondary' : 'outline'}>
					{info.row.original.status}
				</Badge>
			)
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0"><MoreHorizontal className="h-4 w-4" /></Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end">
						<Link to={`edit/${row.original.id}`}><DropdownMenuItem>Edit</DropdownMenuItem></Link>
						<DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
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
		<div className="flex flex-col gap-6">
			<MetaDetails metaTitle="Manage Tours | Admin" />
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Tours</h1>
				<Link to="add">
					<Button size="sm"><PlusCircle className="mr-2 h-4 w-4" /> Add Tour</Button>
				</Link>
			</div>

			<div className="flex justify-between items-center">
				<Form method="get" className="relative w-72">
					<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
					<Input name="q" placeholder="Search tours..." className="pl-8" defaultValue={query} />
				</Form>
				<TableColumnsToggle table={table} />
			</div>

			{isFetching ? (
				<DataTableSkeleton noOfSkeletons={5} columns={columns} />
			) : (
				<DataTable table={table} total={data.total} pageSize={10} onPageChange={() => {}} />
			)}
		</div>
	);
}
