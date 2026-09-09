import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { TourRegistration } from "@workspace/shared/types/booking";
import { format } from "date-fns";
import { MoreHorizontal, Search, User, Phone, MapPin } from "lucide-react";
import { useState } from "react";
import {
	Form,
	useLoaderData,
	useLocation,
	useNavigation,
	useSearchParams,
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
import { allRegistrationsQuery } from "~/queries/registrations.q";
import { GetPaginationControls } from "~/utils/getPaginationControls";
import { getPaginationQueryPayload } from "~/utils/getPaginationQueryPayload";

export const loader = async ({ request }: any) => {
	const { q, pageIndex, pageSize } = getPaginationQueryPayload({ request });
	const data = await allRegistrationsQuery({ request, pageSize, q, pageIndex });
	return { data, query: q, pageIndex, pageSize };
};

export default function BookingsPage() {
	const { data, query, pageIndex, pageSize } = useLoaderData<typeof loader>();
	const navigation = useNavigation();
	const location = useLocation();
	const [selectedReg, setSelectedReg] = useState<TourRegistration | null>(null);

	const isFetchingThisRoute = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const tableColumns: ColumnDef<TourRegistration, unknown>[] = [
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
			accessorKey: "app_users.first_name",
			header: "Customer",
			cell: ({ row }) => (
				<div className="flex flex-col">
					<span className="font-medium">{row.original.app_users?.first_name} {row.original.app_users?.last_name}</span>
					<span className="text-xs text-muted-foreground">{row.original.app_users?.phone_number}</span>
				</div>
			)
		},
		{
			id: "Travellers",
			accessorKey: "travellers_count",
			header: "Travellers",
		},
		{
			id: "Status",
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge variant={row.original.status === 'CONFIRMED' ? 'default' : row.original.status === 'PENDING' ? 'warning' : 'destructive'}>
					{row.original.status}
				</Badge>
			)
		},
		{
			id: "Date",
			accessorKey: "registration_date",
			header: "Reg. Date",
			cell: ({ row }) => row.original.registration_date ? format(new Date(row.original.registration_date), "PP") : 'N/A'
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

	const { onPageChange, onPageSizeChange } = GetPaginationControls({});

	const table = useReactTable({
		data: data.registrations ?? [],
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount: Math.ceil(data.total / pageSize),
		state: { pagination: { pageIndex, pageSize } },
	});

	return (
		<div className="flex flex-1 flex-col gap-6">
			<MetaDetails metaTitle="Tour Registrations | Admin" />
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Tour Registrations</h1>
			</div>

			<div className="rounded-md flex flex-col gap-4">
				<div className="flex justify-between items-center">
					<Form method="get" className="relative w-72">
						<Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
						<Input name="q" placeholder="Search registrations..." className="pl-8" defaultValue={query} />
					</Form>
					<TableColumnsToggle table={table} />
				</div>

				{isFetchingThisRoute ? (
					<DataTableSkeleton noOfSkeletons={10} columns={tableColumns} />
				) : (
					<DataTable
						table={table}
						onPageChange={onPageChange}
						onPageSizeChange={onPageSizeChange}
						pageSize={pageSize}
						total={data.total}
					/>
				)}
			</div>

			{/* Registration Details Dialog */}
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
									<p><strong>Name:</strong> {(selectedReg.profile_snapshot as any).first_name} {(selectedReg.profile_snapshot as any).last_name}</p>
									<p><strong>Gender:</strong> {(selectedReg.profile_snapshot as any).gender}</p>
									<p><strong>DOB:</strong> {(selectedReg.profile_snapshot as any).date_of_birth}</p>
									<p><strong>Phone:</strong> {(selectedReg.profile_snapshot as any).phone_number}</p>
									<p><strong>WhatsApp:</strong> {(selectedReg.profile_snapshot as any).whatsapp_number}</p>
									<p><strong>ID:</strong> {(selectedReg.profile_snapshot as any).identity_type}: {(selectedReg.profile_snapshot as any).identity_number}</p>
								</div>
							</div>

							<div className="space-y-4">
								<h4 className="font-bold flex items-center gap-2"><MapPin className="h-4 w-4" /> Contact & Address</h4>
								<div className="text-sm space-y-2 bg-muted p-4 rounded-lg">
									<p><strong>Address:</strong> {(selectedReg.profile_snapshot as any).address_house}, {(selectedReg.profile_snapshot as any).address_street}</p>
									<p><strong>Locality:</strong> {(selectedReg.profile_snapshot as any).address_locality}, {(selectedReg.profile_snapshot as any).address_district}</p>
									<p><strong>PIN:</strong> {(selectedReg.profile_snapshot as any).address_pin_code}</p>
									<p><strong>Country:</strong> {(selectedReg.profile_snapshot as any).country}</p>
									<Separator className="my-2" />
									<p className="font-semibold text-xs text-primary uppercase">Emergency Contact</p>
									<p><strong>Name:</strong> {(selectedReg.profile_snapshot as any).emergency_contact_name}</p>
									<p><strong>Phone:</strong> {(selectedReg.profile_snapshot as any).emergency_contact_number}</p>
								</div>
							</div>
						</div>

						{selectedReg.notes && (
							<div className="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
								<p className="text-sm font-medium">Customer Notes:</p>
								<p className="text-sm italic">"{selectedReg.notes}"</p>
							</div>
						)}

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

	const { onPageChange, onPageSizeChange } = GetPaginationControls({});

	const table = useReactTable({
		data: (data.bookings as HighLevelBooking[]) ?? [],
		columns: tableColumns,
		getCoreRowModel: getCoreRowModel(),
		manualPagination: true,
		pageCount,
		state: {
			pagination: {
				pageIndex,
				pageSize,
			},
		},
	});

	return (
		<>
			<MetaDetails
				metaTitle="Tour Bookings | Admin Panel"
				metaDescription="Manage your bookings here."
				metaKeywords="bookings, Manage"
			/>
			<section className="flex flex-1 flex-col gap-6">
				<div>
					<h1 className="text-2xl font-semibold">Bookings</h1>

					{query && (
						<div className="mt-3">
							<p>Showing records for "{query?.trim()}"</p>
						</div>
					)}
				</div>
				<div className="rounded-md flex flex-col gap-4">
					<DataTableViewOptions table={table} disabled={isFetchingThisRoute} />
					{isFetchingThisRoute ? (
						<DataTableSkeleton noOfSkeletons={10} columns={tableColumns} />
					) : (
						<DataTable
							table={table}
							onPageChange={onPageChange}
							onPageSizeChange={onPageSizeChange}
							pageSize={pageSize}
							total={data.total ?? 0}
						/>
					)}
				</div>
			</section>
			<Outlet />
		</>
	);
}

function DataTableViewOptions({ table, disabled }: DataTableViewOptionsProps<HighLevelBooking>) {
	const [searchParams] = useSearchParams();
	let currentQuery = searchParams.get("q") ?? "";

	return (
		<div className="w-full flex justify-between gap-4 items-center">
			<div>
				<Form method="get" action="/bookings">
					<div className="relative">
						<Search
							className="absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground"
							width={18}
						/>
						<Input
							placeholder="Search by reference id"
							name="q"
							className="w-full pl-8 md:min-w-75"
							id="search"
							defaultValue={currentQuery}
							disabled={disabled}
							maxLength={10}
						/>
					</div>
					{/* Invisible submit button: Enter in input triggers submit */}
					<button type="submit" className="hidden">
						Search
					</button>
				</Form>
			</div>
			<TableColumnsToggle table={table} />
		</div>
	);
}
