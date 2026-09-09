import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Search, User, MapPin } from "lucide-react";
import { useState } from "react";
import {
	Form,
	useLoaderData,
	useLocation,
	useNavigation,
} from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import {
	DataTable,
	DataTableSkeleton,
	TableColumnsToggle,
} from "~/components/Table/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { BookingService } from "@workspace/shared/services/booking.service";

export const clientLoader = async () => {
	const svc = new BookingService();
	const data = await svc.getAllRegistrations();
	return { data };
};

export default function BookingsPage() {
	const { data } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const location = useLocation();
	const [selectedReg, setSelectedReg] = useState<any | null>(null);

	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const tableColumns: ColumnDef<any, unknown>[] = [
		{
			id: "Tour",
			accessorKey: "tours.name",
			header: "Tour",
			cell: ({ row }) => (
				<div className="font-medium">
					{row.original.tours?.name}
					<div className="text-xs text-muted-foreground font-mono">{row.original.tours?.tour_code}</div>
				</div>
			)
		},
		{
			id: "Customer",
			accessorKey: "profileSnapshot.first_name",
			header: "Customer",
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.profileSnapshot?.first_name} {row.original.profileSnapshot?.last_name}</span>
					<span className="text-xs text-muted-foreground">{row.original.profileSnapshot?.phone_number}</span>
				</div>
			)
		},
		{
			id: "Travellers",
			accessorKey: "travellersCount",
			header: "Travellers",
		},
		{
			id: "Status",
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge variant={row.original.status === 'CONFIRMED' ? 'default' : 'warning'}>
					{row.original.status}
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
						<DropdownMenuItem onClick={() => setSelectedReg(row.original)}>View Details</DropdownMenuItem>
						<DropdownMenuItem className="text-destructive">Cancel</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			)
		}
	];

	const table = useReactTable({
		data: data.registrations ?? [],
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="flex flex-1 flex-col gap-6">
			<MetaDetails metaTitle="Tour Registrations | Admin" />
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Tour Registrations</h1>
			</div>

			<div className="rounded-md flex flex-col gap-4">
				{isFetching ? (
					<DataTableSkeleton noOfSkeletons={10} columns={tableColumns} />
				) : (
					<DataTable
						table={table}
						pageSize={10}
						total={data.total}
						onPageChange={() => {}}
					/>
				)}
			</div>

			<Dialog open={!!selectedReg} onOpenChange={() => setSelectedReg(null)}>
				{selectedReg && (
					<DialogContent className="max-w-2xl">
						<DialogHeader>
							<DialogTitle>Registration Details</DialogTitle>
							<DialogDescription>Full details for registration on {selectedReg.tours?.name}</DialogDescription>
						</DialogHeader>

						<div className="grid md:grid-cols-2 gap-6 py-4">
							<div className="space-y-4">
								<h4 className="font-bold flex items-center gap-2"><User className="h-4 w-4" /> Customer Profile Snapshot</h4>
								<div className="text-sm space-y-2 bg-muted p-4 rounded-lg">
									<p><strong>Name:</strong> {selectedReg.profileSnapshot?.first_name} {selectedReg.profileSnapshot?.last_name}</p>
									<p><strong>Email:</strong> {selectedReg.profileSnapshot?.email}</p>
									<p><strong>Phone:</strong> {selectedReg.profileSnapshot?.phone_number}</p>
								</div>
							</div>

							<div className="space-y-4">
								<h4 className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Address</h4>
								<div className="text-sm space-y-2 bg-muted p-4 rounded-lg">
									<p><strong>Address:</strong> {selectedReg.profileSnapshot?.address_house}, {selectedReg.profileSnapshot?.address_street}</p>
									<p><strong>Country:</strong> {selectedReg.profileSnapshot?.country}</p>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-2">
							<Button variant="outline" onClick={() => setSelectedReg(null)}>Close</Button>
							<Button>Confirm Registration</Button>
						</div>
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}
