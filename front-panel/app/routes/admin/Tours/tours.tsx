import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import type { HighLevelTour } from "@workspace/shared/types/tours";
import {
	MoreHorizontal,
	PlusCircle,
	Search,
	MapPin,
	IndianRupee,
	Edit3,
	Trash2,
	ExternalLink,
	Compass,
	Megaphone,
} from "lucide-react";
import React from "react";
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
import { ToursService } from "@workspace/shared/services/tours.service";
import { BookingService } from "@workspace/shared/services/booking.service";

export const clientLoader = async ({ request }: any) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const svc = new ToursService();
	const bookingSvc = new BookingService();

	const [data, allRegs] = await Promise.all([svc.getHighLevelTours(q), bookingSvc.getAllRegistrations()]);

	// Map pilgrim counts and details to tours
	const toursWithRegs = data.tours.map((tour) => {
		const regs = allRegs.registrations.filter((r: any) => r.tourId === tour.id);
		return {
			...tour,
			registrations: regs,
			pilgrimCount: regs.reduce((acc: number, r: any) => acc + (r.travellersCount || 0), 0),
		};
	});

	return { data: { ...data, tours: toursWithRegs }, query: q };
};

export default function AdminToursPage() {
	const { data, query } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const location = useLocation();

	const isFetching =
		navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const columns: ColumnDef<HighLevelTour, unknown>[] = [
		{
			id: "Tour",
			header: "Journey Details",
			cell: ({ row }) => {
				const [imgError, setImgError] = React.useState(false);
				const hasValidImage =
					!imgError &&
					row.original.cover_image &&
					row.original.cover_image.startsWith("http");

				return (
					<div className="flex items-center gap-4 py-1">
						<div className="h-12 w-12 rounded-xl overflow-hidden bg-muted border border-primary/10 flex-shrink-0 flex items-center justify-center">
							{hasValidImage ? (
								<img
									src={row.original.cover_image!}
									className="h-full w-full object-cover"
									alt=""
									onError={() => setImgError(true)}
								/>
							) : (
								<Compass className="h-6 w-6 text-primary/30" />
							)}
						</div>
						<div className="space-y-0.5">
							<div className="font-bold text-foreground leading-tight">{row.original.name}</div>
							<div className="text-[10px] font-mono text-foreground/40 uppercase tracking-tighter">
								{row.original.tour_code}
							</div>
						</div>
					</div>
				);
			},
		},
		{
			id: "Destination",
			accessorKey: "destination",
			header: "Destination",
			cell: (info) => (
				<div className="flex items-center gap-2 text-foreground/60">
					<MapPin className="h-3.5 w-3.5 text-primary/50" />
					<span className="text-xs font-semibold uppercase tracking-wider">
						{info.getValue() as string}
					</span>
				</div>
			),
		},
		{
			id: "Price",
			accessorKey: "price",
			header: "Price",
			cell: (info) => (
				<div className="flex items-center font-serif text-lg text-primary">
					<IndianRupee className="h-4 w-4" />
					<span className="ml-0.5 font-bold">
						{(info.getValue() as number) > 0
							? (info.getValue() as number).toLocaleString()
							: "Inquiry"}
					</span>
				</div>
			),
		},
		{
			id: "Status",
			accessorKey: "status",
			header: "Status",
			cell: (info) => {
				const status = info.getValue() as string;
				const variants: any = {
					REGISTRATION_OPEN: "text-emerald-600 border-emerald-600/20 bg-emerald-50",
					PUBLISHED: "text-primary border-primary/20 bg-primary/5",
					REGISTRATION_CLOSED: "text-red-600 border-red-600/20 bg-red-50",
					DRAFT: "text-slate-500 border-slate-500/20 bg-slate-50",
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
						<Link to={`announcement/${row.original.id}`} prefetch="intent">
							<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5">
								<Megaphone className="mr-3 h-4.5 w-4.5 opacity-60 text-primary" /> Send
								Announcement
							</DropdownMenuItem>
						</Link>
						<Link to={`edit/${row.original.id}`} prefetch="intent">
							<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5">
								<Edit3 className="mr-3 h-4.5 w-4.5 opacity-60 text-primary" /> Edit Journey
							</DropdownMenuItem>
						</Link>
						<a href={`/tours/tour/${row.original.id}`} target="_blank">
							<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5">
								<ExternalLink className="mr-3 h-4.5 w-4.5 opacity-60 text-primary" /> View
								Live
							</DropdownMenuItem>
						</a>
						<DropdownMenuSeparator className="bg-primary/5 mx-1" />
						<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-red-600 focus:bg-red-50">
							<Trash2 className="mr-3 h-4.5 w-4.5" /> Delete Journey
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const table = useReactTable({
		data: data.tours ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
			<MetaDetails
				metaTitle="Inventory Management | AMBADY"
				metaDescription="Track all initiated spiritual journeys."
			/>

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-8">
				<div>
					<h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">
						Journey Inventory
					</h1>
					<p className="text-foreground/40 mt-3 text-sm uppercase tracking-[0.2em] font-bold">
						Manage and track all pilgrimage experiences.
					</p>
				</div>
				<Button
					asChild
					className="rounded-full px-10 h-14 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px] shadow-xl shadow-primary/20 hover:scale-105 transition-all"
				>
					<Link to="add" prefetch="intent">
						<PlusCircle className="mr-3 h-5 w-5" /> Initiate New Journey
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
								placeholder="Search by journey name or sacred code..."
								className="h-14 pl-14 rounded-2xl bg-white border-primary/20 text-foreground focus-visible:ring-primary/20 placeholder:text-foreground/30 shadow-sm"
								defaultValue={query}
							/>
						</Form>
						<TableColumnsToggle table={table} />
					</div>

					{isFetching ? (
						<div className="p-12">
							<DataTableSkeleton noOfSkeletons={6} columns={columns} />
						</div>
					) : (
						<div className="bg-card">
							<DataTable
								table={table}
								total={data.total}
								pageSize={10}
								onPageChange={() => {}}
							/>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
