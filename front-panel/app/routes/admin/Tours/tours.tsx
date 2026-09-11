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
import { BookingService } from "@workspace/shared/services/booking.service";
import { Card, CardContent } from "~/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
import { useState } from "react";
import { format } from "date-fns";

export const clientLoader = async ({ request }: any) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const svc = new ToursService();
	const bookingSvc = new BookingService();

	const [data, allRegs] = await Promise.all([
		svc.getHighLevelTours(q),
		bookingSvc.getAllRegistrations()
	]);

	// Map pilgrim counts and details to tours
	const toursWithRegs = data.tours.map(tour => {
		const regs = allRegs.registrations.filter((r: any) => r.tourId === tour.id);
		return {
			...tour,
			registrations: regs,
			pilgrimCount: regs.reduce((acc: number, r: any) => acc + (r.travellersCount || 0), 0)
		};
	});

	return { data: { ...data, tours: toursWithRegs }, query: q };
};

export default function AdminToursPage() {
	const { data, query } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const location = useLocation();

	const [selectedTourRegs, setSelectedTourRegs] = useState<any[] | null>(null);
	const [selectedTourName, setSelectedTourName] = useState("");

	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const columns: ColumnDef<HighLevelTour, unknown>[] = [
		{
			id: "Tour",
			header: "Pilgrimage Journey Details",
			cell: ({ row }) => {
				const [imgError, setImgError] = React.useState(false);
				const isUrlValid = (url: string | null | undefined) => {
					return !!(url && url.length > 12 && url.startsWith("http") && !url.endsWith("-"));
				};
				const hasValidImage = !imgError && isUrlValid(row.original.cover_image);

				return (
					<div className="flex items-center gap-4">
						<div className="h-10 w-10 rounded-lg overflow-hidden bg-white/5 border border-white/10 flex-shrink-0 flex items-center justify-center">
							{hasValidImage ? (
								<img
									src={row.original.cover_image!}
									className="h-full w-full object-cover grayscale opacity-60"
									alt=""
									onError={() => setImgError(true)}
								/>
							) : (
								<Compass className="h-5 w-5 text-[#d4af37] opacity-20" />
							)}
						</div>
						<div>
							<div className="font-bold text-[#fdfcf0]">{row.original.name}</div>
							<div className="text-[10px] font-mono text-[#fdfcf0]/40 uppercase tracking-tighter">{row.original.tour_code}</div>
						</div>
					</div>
				);
			}
		},
		{
			id: "Destination",
			accessorKey: "destination",
			header: "Location",
			cell: (info) => (
				<div className="flex items-center gap-1.5 text-[#fdfcf0]/60">
					<MapPin className="h-3.5 w-3.5 text-[#d4af37]/60" />
					<span className="text-xs font-medium">{info.getValue() as string}</span>
				</div>
			)
		},
		{
			id: "Price",
			accessorKey: "price",
			header: "Price",
			cell: (info) => (
				<div className="flex items-center font-serif text-lg text-[#d4af37]">
					<IndianRupee className="h-3.5 w-3.5" />
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
					REGISTRATION_OPEN: "text-emerald-400 border-emerald-400/20 bg-emerald-400/5",
					PUBLISHED: "text-[#d4af37] border-[#d4af37]/20 bg-[#d4af37]/5",
					REGISTRATION_CLOSED: "text-red-400 border-red-400/20 bg-red-400/5",
					DRAFT: "text-slate-400 border-slate-400/20 bg-slate-400/5",
				};
				return (
					<Badge className={`px-2 py-0.5 rounded-full border shadow-none font-bold text-[8px] uppercase tracking-widest ${variants[status] || ""}`}>
						{status?.replace('_', ' ')}
					</Badge>
				);
			}
		},
		{
			id: "Pilgrims",
			header: "Pilgrims",
			cell: ({ row }) => (
				<button
					onClick={() => {
						setSelectedTourRegs(row.original.registrations);
						setSelectedTourName(row.original.name);
					}}
					className="flex flex-col items-center gap-1 hover:scale-110 transition-transform cursor-pointer group"
				>
					<div className="flex -space-x-2">
						{[...Array(Math.min(row.original.registrations.length, 3))].map((_, i) => (
							<div key={i} className="h-6 w-6 rounded-full border border-white/10 bg-[#d4af37]/10 flex items-center justify-center">
								<User className="h-3 w-3 text-[#d4af37]/60" />
							</div>
						))}
						{row.original.registrations.length > 3 && (
							<div className="h-6 w-6 rounded-full border border-white/10 bg-[#0a0e1a] flex items-center justify-center text-[8px] font-bold text-[#d4af37]">
								+{row.original.registrations.length - 3}
							</div>
						)}
					</div>
					<span className="text-[10px] font-bold text-[#fdfcf0]/40 group-hover:text-[#d4af37]">{row.original.pilgrimCount} Total</span>
				</button>
			)
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button variant="ghost" className="h-8 w-8 p-0 rounded-full hover:bg-white/5"><MoreHorizontal className="h-4 w-4 text-[#fdfcf0]/40" /></Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 shadow-2xl bg-[#0a0e1a] border border-white/10">
						<Link to={`edit/${row.original.id}`} prefetch="intent">
							<DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 text-[#fdfcf0]/80 focus:bg-[#d4af37]/10">
								<Edit3 className="mr-2 h-4 w-4 opacity-50" /> Edit Details
							</DropdownMenuItem>
						</Link>
						<a href={`/tours/tour/${row.original.id}`} target="_blank">
							<DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 text-[#fdfcf0]/80 focus:bg-[#d4af37]/10">
								<ExternalLink className="mr-2 h-4 w-4 opacity-50" /> Preview Live
							</DropdownMenuItem>
						</a>
						<DropdownMenuSeparator className="bg-white/5" />
						<DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 text-red-400 focus:bg-red-950/30">
							<Trash2 className="mr-2 h-4 w-4" /> Delete Journey
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
			<MetaDetails metaTitle="Manage Inventory | AMBADY PILGRIMAGE EXPERIENCES Admin" metaDescription="Track all initiated spiritual journeys." />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				<div>
					<h1 className="text-4xl font-serif text-[#fdfcf0] tracking-tight">Pilgrimage Journey Inventory</h1>
					<p className="text-[#fdfcf0]/40 mt-2 text-sm uppercase tracking-widest font-bold">Manage and track all initiated experiences.</p>
				</div>
				<Button asChild className="rounded-full px-8 h-14 bg-[#d4af37] text-[#0a0e1a] font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-[#d4af37]/10 hover:bg-[#b8860b]">
					<Link to="add" prefetch="intent"><PlusCircle className="mr-2 h-4 w-4" /> Initiate New Journey</Link>
				</Button>
			</div>

			<div className="bg-white/5 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
				<div className="p-0">
					<div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between gap-4 items-center bg-[#d4af37]/5">
						<Form method="get" className="relative w-full md:w-96">
							<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#d4af37]/40" />
							<Input name="q" placeholder="Search by name or code..." className="h-12 pl-12 rounded-xl bg-white/5 border-white/10 text-[#fdfcf0] focus-visible:ring-[#d4af37]/20" defaultValue={query} />
						</Form>
						<TableColumnsToggle table={table} />
					</div>

					{isFetching ? (
						<div className="p-6 bg-[#0a0e1a]"><DataTableSkeleton noOfSkeletons={5} columns={columns} /></div>
					) : (
						<div className="bg-[#0a0e1a]">
							<DataTable table={table} total={data.total} pageSize={10} onPageChange={() => {}} />
						</div>
					)}
				</div>
			</div>

			{/* Pilgrims List Dialog */}
			<Dialog open={!!selectedTourRegs} onOpenChange={() => setSelectedTourRegs(null)}>
				<DialogContent className="max-w-2xl bg-[#0a0e1a] border-white/10 text-[#fdfcf0] max-h-[80vh] flex flex-col p-0 overflow-hidden">
					<DialogHeader className="p-8 bg-[#d4af37]/5 border-b border-white/5">
						<DialogTitle className="text-2xl font-serif">{selectedTourName}</DialogTitle>
						<DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37]/60">Registered Pilgrims Inventory</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto p-8">
						{selectedTourRegs && selectedTourRegs.length > 0 ? (
							<div className="space-y-4">
								{selectedTourRegs.map((reg) => (
									<div key={reg.id} className="p-6 rounded-3xl bg-white/5 border border-white/5 flex items-center justify-between group hover:border-[#d4af37]/30 transition-all">
										<div className="flex items-center gap-5">
											<div className="h-12 w-12 rounded-full bg-[#d4af37]/10 flex items-center justify-center text-[#d4af37]/60">
												<User className="h-6 w-6" />
											</div>
											<div>
												<p className="font-bold text-[#fdfcf0]">{reg.profileSnapshot?.first_name} {reg.profileSnapshot?.last_name}</p>
												<div className="flex items-center gap-4 text-[10px] text-[#fdfcf0]/40 font-medium tracking-wide">
													<span>{reg.profileSnapshot?.email}</span>
													<span className="h-1 w-1 rounded-full bg-white/10" />
													<span>{reg.profileSnapshot?.phone_number || "No Phone"}</span>
												</div>
											</div>
										</div>
										<div className="text-right">
											<Badge className="bg-[#d4af37]/10 text-[#d4af37] border-none px-3 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest">{reg.travellersCount} Pilgrims</Badge>
											<p className="text-[8px] text-[#fdfcf0]/20 font-bold uppercase tracking-widest mt-2">{reg.createdAt ? format(new Date(reg.createdAt), "dd MMM yyyy") : "Recent"}</p>
										</div>
									</div>
								))}
							</div>
						) : (
							<div className="h-48 flex flex-col items-center justify-center gap-3 opacity-20">
								<Users className="h-10 w-10" />
								<p className="text-xs font-bold uppercase tracking-widest">No Pilgrims Registered</p>
							</div>
						)}
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
