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
} from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import {
	DataTable,
	DataTableSkeleton,
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
import { maskAadhar } from "@workspace/shared/utils/ui";
import { type TourRegistration } from "@workspace/shared/types/booking";

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
		users: users.filter((u: any) => u.role !== "admin")
	};
};

export const clientAction = async ({ request }: any) => {
	const formData = await request.formData();
	const intent = formData.get("intent");

	if (intent === "manual-register") {
		const tourId = formData.get("tourId") as string;
		const isNewUser = formData.get("isNewUser") === "true";
		const travellersCount = Number(formData.get("travellersCount"));
		const notes = formData.get("notes") as string;

		const bookingSvc = new BookingService();
		const authSvc = new AuthService();

		try {
			let customerId = formData.get("customerId") as string;

			if (isNewUser) {
				const firstName = formData.get("firstName") as string;
				const lastName = formData.get("lastName") as string;
				const email = formData.get("email") as string;
				const aadharNumber = formData.get("aadharNumber") as string;
				const phone = formData.get("phone") as string;

				const res = await authSvc.adminCreateUserAndProfile({ firstName, lastName, email, aadharNumber, phone });
				if (!res.success) throw new Error(res.error);
				customerId = res.uid!;
			}

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
	const [isNewUser, setIsNewUser] = useState(false);

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
			const exportData = data.registrations.map((reg: TourRegistration) => ({
				"Tour Name": reg.tours?.name || "N/A",
				"Tour Code": reg.tours?.tour_code || "N/A",
				"Customer Name": `${reg.profileSnapshot?.first_name || ""} ${reg.profileSnapshot?.last_name || ""}`,
				"Email": reg.profileSnapshot?.email || "N/A",
				"Phone": reg.profileSnapshot?.phone_number || "N/A",
				"Travellers": reg.travellersCount,
				"Status": reg.status,
				"Amount (INR)": (reg.tours?.price * reg.travellersCount) || 0,
				"Registration Date": reg.createdAt ? format(new Date(reg.createdAt as any), "yyyy-MM-dd HH:mm") : "N/A",
			}));

			const worksheet = XLSX.utils.json_to_sheet(exportData);
			const workbook = XLSX.utils.book_new();
			XLSX.utils.book_append_sheet(workbook, worksheet, "Registrations");
			XLSX.writeFile(workbook, `AMBADY_Registrations_${format(new Date(), "yyyyMMdd")}.xlsx`);
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
				<div className="flex flex-col gap-1">
					<span className="font-bold text-[#fdfcf0]">{row.original.tours?.name}</span>
					<span className="text-[10px] text-[#fdfcf0]/40 font-mono uppercase">{row.original.tours?.tour_code}</span>
				</div>
			)
		},
		{
			id: "Customer",
			accessorKey: "profileSnapshot.first_name",
			header: "Customer",
			cell: ({ row }) => (
				<div className="flex flex-col gap-0.5">
					<span className="font-bold text-[#fdfcf0]">{row.original.profileSnapshot?.first_name} {row.original.profileSnapshot?.last_name}</span>
					<span className="text-[10px] text-[#fdfcf0]/40 font-medium tracking-wide">{row.original.profileSnapshot?.phone_number}</span>
				</div>
			)
		},
		{
			id: "Amount",
			header: "Total (INR)",
			cell: ({ row }) => (
				<span className="font-serif text-lg text-[#d4af37]">
					₹{((row.original.tours?.price || 0) * row.original.travellersCount).toLocaleString()}
				</span>
			)
		},
		{
			id: "Status",
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge className={`px-2 py-0.5 rounded-full border shadow-none font-bold text-[8px] uppercase tracking-widest ${row.original.status === 'CONFIRMED' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5' : 'text-[#d4af37] border-[#d4af37]/20 bg-[#d4af37]/5'}`}>
					{row.original.status}
				</Badge>
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
						<DropdownMenuItem onClick={() => setSelectedReg(row.original)} className="rounded-xl cursor-pointer py-2.5 text-[#fdfcf0]/80 focus:bg-[#d4af37]/10">View Details</DropdownMenuItem>
						<DropdownMenuItem className="rounded-xl cursor-pointer py-2.5 text-red-400 focus:bg-red-950/30">Cancel</DropdownMenuItem>
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
		<div className="flex flex-1 flex-col gap-8 animate-in fade-in duration-700">
			<MetaDetails metaTitle="Pilgrimage Journey Registrations | Admin" metaDescription="Manage pilgrim registrations and journeys." />

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
				<div>
					<h1 className="text-4xl font-serif text-[#fdfcf0] tracking-tight">Pilgrim Registrations</h1>
					<p className="text-[#fdfcf0]/40 mt-2 text-sm uppercase tracking-widest font-bold">Manage and track all spiritual journey participants.</p>
				</div>
				<div className="flex gap-4">
					<Button className="rounded-full bg-white/5 border border-white/10 text-[#fdfcf0] hover:bg-white/10 px-8 h-14 text-[10px] font-bold uppercase tracking-widest transition-all" onClick={() => setIsManualRegOpen(true)}>
						<Plus className="mr-2 h-4 w-4" /> Manual Registration
					</Button>
					<Button
						className="rounded-full bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] px-8 h-14 text-[10px] font-bold uppercase tracking-widest transition-all shadow-lg shadow-[#d4af37]/10"
						onClick={handleExport}
						disabled={isExporting || data.registrations.length === 0}
					>
						{isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Download className="mr-2 h-4 w-4" />}
						Excel Export
					</Button>
				</div>
			</div>

			<div className="surface-card-strong rounded-[2rem] overflow-hidden shadow-2xl">
				{isFetching ? (
					<div className="p-8 bg-black/20"><DataTableSkeleton noOfSkeletons={10} columns={tableColumns} /></div>
				) : (
					<div className="bg-black/20">
						<DataTable
							table={table}
							pageSize={10}
							total={data.total}
							onPageChange={() => {}}
						/>
					</div>
				)}
			</div>

			{/* Manual Registration Dialog */}
			<Dialog open={isManualRegOpen} onOpenChange={setIsManualRegOpen}>
				<DialogContent className="max-w-md surface-card-solid border-white/10 text-[#fdfcf0] shadow-2xl">
					<DialogHeader className="p-2 border-b border-white/5 mb-4">
						<DialogTitle className="text-2xl font-serif">Manual Registration</DialogTitle>
						<DialogDescription className="text-[#fdfcf0]/60 text-[10px] uppercase tracking-widest mt-1">Register a pilgrim for a journey manually.</DialogDescription>
					</DialogHeader>
					<form onSubmit={handleManualSubmit} className="space-y-6 py-2">
						<div className="space-y-3">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">Select Pilgrimage Journey</Label>
							<Select name="tourId" required>
								<SelectTrigger className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl focus:ring-[#d4af37]/20"><SelectValue placeholder="Choose a pilgrimage journey" /></SelectTrigger>
								<SelectContent className="surface-card-solid border-white/10 text-[#fdfcf0]">
									{tours.map((t: any) => (
										<SelectItem key={t.id} value={t.id} className="focus:bg-[#d4af37]/10">{t.name} ({t.tour_code})</SelectItem>
									))}
								</SelectContent>
							</Select>
						</div>

						<div className="flex items-center gap-3 p-1 bg-white/5 rounded-xl border border-white/5">
							<input
								type="checkbox"
								id="isNewUser"
								name="isNewUser"
								value="true"
								checked={isNewUser}
								onChange={(e) => setIsNewUser(e.target.checked)}
								className="h-4 w-4 ml-2 rounded border-white/20 bg-black/40 text-[#d4af37] focus:ring-[#d4af37]/20"
							/>
							<Label htmlFor="isNewUser" className="text-[10px] font-bold uppercase tracking-widest text-[#d4af37] cursor-pointer">Register New Pilgrim</Label>
						</div>

						{isNewUser ? (
							<div className="space-y-4 animate-in slide-in-from-top-2 duration-300">
								<div className="grid grid-cols-2 gap-4">
									<div className="space-y-2">
										<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">First Name</Label>
										<Input name="firstName" placeholder="First Name" required className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl" />
									</div>
									<div className="space-y-2">
										<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">Last Name</Label>
										<Input name="lastName" placeholder="Last Name" required className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl" />
									</div>
								</div>
								<div className="space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">Email Address</Label>
									<Input name="email" type="email" placeholder="pilgrim@example.com" required className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl" />
								</div>
								<div className="space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">Phone Number</Label>
									<Input name="phone" placeholder="10 Digit Number" required className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl" />
								</div>
								<div className="space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">Aadhar Number</Label>
									<Input name="aadharNumber" placeholder="12 Digit Number" required maxLength={12} className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl" />
								</div>
								<p className="text-[9px] text-[#d4af37]/60 font-bold uppercase tracking-widest text-center italic">Default Password: Password123</p>
							</div>
						) : (
							<div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
								<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">Select Existing Pilgrim</Label>
								<Select name="customerId" required>
									<SelectTrigger className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl focus:ring-[#d4af37]/20"><SelectValue placeholder="Choose a pilgrim" /></SelectTrigger>
									<SelectContent className="surface-card-solid border-white/10 text-[#fdfcf0]">
										{users.map((u: any) => (
											<SelectItem key={u.uid} value={u.uid} className="focus:bg-[#d4af37]/10">{u.first_name} {u.last_name} ({u.email})</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}

						<div className="space-y-3">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">Pilgrims Count</Label>
							<Input type="number" name="travellersCount" defaultValue={1} min={1} required className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl focus:ring-[#d4af37]/20" />
						</div>
						<div className="space-y-3">
							<Label className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/40 ml-1">Notes</Label>
							<Input name="notes" placeholder="Optional notes..." className="h-12 bg-black/40 border-white/10 text-[#fdfcf0] rounded-xl focus:ring-[#d4af37]/20" />
						</div>
						<DialogFooter className="pt-6">
							<Button type="button" variant="ghost" onClick={() => setIsManualRegOpen(false)} className="text-[#fdfcf0]/40 hover:text-[#fdfcf0] h-12">Cancel</Button>
							<Button type="submit" disabled={isSubmitting} className="bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] font-bold uppercase tracking-widest text-[10px] px-10 h-14 rounded-full shadow-lg shadow-[#d4af37]/10">
								{isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Register Pilgrim"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog open={!!selectedReg} onOpenChange={() => setSelectedReg(null)}>
				{selectedReg && (
					<DialogContent className="max-w-2xl surface-card-solid border-white/10 text-[#fdfcf0] shadow-2xl">
						<DialogHeader className="p-2 border-b border-white/5 mb-6">
							<DialogTitle className="text-3xl font-serif text-[#d4af37]">Registration Details</DialogTitle>
							<DialogDescription className="text-[10px] font-bold uppercase tracking-[0.4em] text-[#fdfcf0]/40 mt-1">Full details for registration on {selectedReg.tours?.name}</DialogDescription>
						</DialogHeader>

						<div className="grid md:grid-cols-2 gap-8 py-2">
							<div className="space-y-4">
								<h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] flex items-center gap-2">
									<User className="h-4 w-4" /> Pilgrim Profile
								</h4>
								<div className="text-sm space-y-3 bg-black/40 p-6 rounded-[1.5rem] border border-white/5">
									<p className="flex justify-between items-center"><span className="text-[#fdfcf0]/40 font-bold uppercase text-[9px] tracking-widest">Name</span> <span className="font-serif text-lg">{selectedReg.profileSnapshot?.first_name} {selectedReg.profileSnapshot?.last_name}</span></p>
									<p className="flex justify-between items-center"><span className="text-[#fdfcf0]/40 font-bold uppercase text-[9px] tracking-widest">Email</span> <span className="text-xs">{selectedReg.profileSnapshot?.email}</span></p>
									<p className="flex justify-between items-center"><span className="text-[#fdfcf0]/40 font-bold uppercase text-[9px] tracking-widest">Phone</span> <span className="text-xs">{selectedReg.profileSnapshot?.phone_number}</span></p>
									<p className="flex justify-between items-center"><span className="text-[#fdfcf0]/40 font-bold uppercase text-[9px] tracking-widest">Aadhar</span> <span className="font-mono text-xs">{maskAadhar(selectedReg.profileSnapshot?.aadhar_number)}</span></p>
								</div>
							</div>

							<div className="space-y-4">
								<h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#d4af37] flex items-center gap-2">
									<MapPin className="h-4 w-4" /> Residency
								</h4>
								<div className="text-sm space-y-3 bg-black/40 p-6 rounded-[1.5rem] border border-white/5">
									<p className="flex justify-between items-start gap-4">
										<span className="text-[#fdfcf0]/40 font-bold uppercase text-[9px] tracking-widest mt-1">Location</span>
										<span className="text-right leading-relaxed text-xs">{selectedReg.profileSnapshot?.address_house},<br/>{selectedReg.profileSnapshot?.address_street}</span>
									</p>
									<p className="flex justify-between items-center"><span className="text-[#fdfcf0]/40 font-bold uppercase text-[9px] tracking-widest">Country</span> <span className="text-xs">{selectedReg.profileSnapshot?.country || "Not Provided"}</span></p>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-4 pt-8">
							<Button variant="ghost" onClick={() => setSelectedReg(null)} className="text-[#fdfcf0]/40 hover:text-[#fdfcf0] h-12">Close Details</Button>
							<Button className="bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] font-bold uppercase tracking-widest text-[10px] px-12 h-16 rounded-full shadow-lg shadow-[#d4af37]/20">
								Confirm Registration
							</Button>
						</div>
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}
