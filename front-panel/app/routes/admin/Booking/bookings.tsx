import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, User, MapPin, Download, Loader2, Plus } from "lucide-react";
import { useState, useEffect } from "react";
import {
	useLoaderData,
	useLocation,
	useNavigation,
	useActionData,
	useSubmit,
	Form,
} from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import {
	DataTable,
	DataTableSkeleton,
	TableColumnsToggle,
} from "~/components/Table/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "~/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { BookingService } from "@workspace/shared/services/booking.service";
import { ToursService } from "@workspace/shared/services/tours.service";
import { AuthService } from "@workspace/shared/services/auth.service";
import * as XLSX from "xlsx";
import { toast } from "sonner";

export const clientLoader = async () => {
	const bookingSvc = new BookingService();
	const toursSvc = new ToursService();
	const authSvc = new AuthService();

	const [registrationsResp, toursResp, users] = await Promise.all([
		bookingSvc.getAllRegistrations(),
		toursSvc.getHighLevelTours(),
		authSvc.getAllUsers()
	]);

	return {
		data: registrationsResp,
		tours: toursResp.tours,
		users: users
	};
};

export const clientAction = async ({ request }: any) => {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "manual-register") {
		const tourId = formData.get("tourId");
		const customerId = formData.get("customerId");
		const travellersCount = Number(formData.get("travellersCount"));
		const notes = formData.get("notes");

		const bookingSvc = new BookingService();
		// We need a special method or a way to bypass currentUid for admin
		// For now, let's assume createRegistration can be used if we temporarily set the auth context or have a variant
		// Actually, let's add a `adminCreateRegistration` to BookingService
		try {
			await bookingSvc.adminCreateRegistration(tourId, customerId, travellersCount, notes);
			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}
	return null;
};

export default function BookingsPage() {
	const { data, tours, users } = useLoaderData<typeof clientLoader>();
	const actionData = useActionData() as any;
	const navigation = useNavigation();
	const location = useLocation();
	const submit = useSubmit();

	const [selectedReg, setSelectedReg] = useState<any | null>(null);
	const [isExporting, setIsExporting] = useState(false);
	const [isManualRegOpen, setIsManualRegOpen] = useState(false);

	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;
	const isSubmitting = navigation.state === "submitting";

	useEffect(() => {
		if (actionData?.success) {
			toast.success("Registration created successfully");
			setIsManualRegOpen(false);
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const exportData = data.registrations.map((reg: any) => ({
				"Tour Name": reg.tours?.name || "N/A",
				"Tour Code": reg.tours?.tour_code || "N/A",
				"Customer Name": `${reg.profileSnapshot?.first_name || ""} ${reg.profileSnapshot?.last_name || ""}`,
				"Email": reg.profileSnapshot?.email || "N/A",
				"Phone": reg.profileSnapshot?.phone_number || "N/A",
				"Travellers": reg.travellersCount,
				"Status": reg.status,
				"Amount (INR)": (reg.tours?.price * reg.travellersCount) || 0,
				"Registration Date": reg.createdAt ? format(new Date(reg.createdAt), "yyyy-MM-dd HH:mm") : "N/A",
			}));

			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
			XLSX.writeFile(workbook, `WanderNest_Registrations_${format(new Date(), "yyyyMMdd")}.xlsx`);
		} catch (error) {
			console.error("Export failed:", error);
		} finally {
			setIsExporting(false);
		}
	};

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
			id: "Amount",
			header: "Total (INR)",
			cell: ({ row }) => (
				<span className="font-semibold">
					₹{((row.original.tours?.price || 0) * row.original.travellersCount).toLocaleString()}
				</span>
			)
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

	const handleManualSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		formData.append("intent", "manual-register");
		submit(formData, { method: "post" });
	};

	return (
		<div className="flex flex-1 flex-col gap-6">
			<MetaDetails metaTitle="Tour Registrations | Admin" />
			<div className="flex justify-between items-center">
				<h1 className="text-2xl font-bold">Tour Registrations</h1>
				<div className="flex gap-2">
					<Button variant="outline" size="sm" onClick={() => setIsManualRegOpen(true)}>
						<Plus className="mr-2 h-4 w-4" /> Manual Registration
					</Button>
					<Button
						variant="outline"
						size="sm"
						onClick={handleExport}
						disabled={isExporting || data.registrations.length === 0}
					>
						{isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
						Export to Excel
					</Button>
				</div>
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

			{/* Manual Registration Dialog */}
			<Dialog open={isManualRegOpen} onOpenChange={setIsManualRegOpen}>
				<DialogContent className="max-w-md">
					<DialogHeader>
						<DialogTitle>Manual Registration</DialogTitle>
						<DialogDescription>Register a user for a tour manually.</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleManualSubmit} className="space-y-4 py-4">
						<div className="space-y-2">
							<Label>Select Tour</Label>
							<Select name="tourId" required>
								<SelectTrigger><SelectValue placeholder="Choose a tour" /></SelectTrigger>
								<SelectContent>
									{tours.map((t: any) => (
										<SelectItem key={t.id} value={t.id}>{t.name} ({t.tour_code})</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Select User</Label>
							<Select name="customerId" required>
								<SelectTrigger><SelectValue placeholder="Choose a user" /></SelectTrigger>
								<SelectContent>
									{users.map((u: any) => (
										<SelectItem key={u.uid} value={u.uid}>{u.first_name} {u.last_name} ({u.email})</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>
						<div className="space-y-2">
							<Label>Travellers Count</Label>
							<Input type="number" name="travellersCount" defaultValue={1} min={1} required />
						</div>
						<div className="space-y-2">
							<Label>Notes</Label>
							<Input name="notes" placeholder="Optional notes..." />
						</div>
						<DialogFooter>
							<Button type="button" variant="outline" onClick={() => setIsManualRegOpen(false)}>Cancel</Button>
							<Button type="submit" disabled={isSubmitting}>
								{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register User"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

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
