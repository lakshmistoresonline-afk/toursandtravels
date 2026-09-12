import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import {
	MoreHorizontal,
	User,
	MapPin,
	Download,
	Loader2,
	Plus,
	CheckCircle2,
	Clock,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useLoaderData, useLocation, useNavigation, useActionData, useSubmit } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { DataTable, DataTableSkeleton } from "~/components/Table/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { BackButton } from "~/components/ui/back-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "~/components/ui/dialog";
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
import { maskAadhar, cn } from "@workspace/shared/utils/ui";
import { type TourRegistration } from "@workspace/shared/types/booking";

export const clientLoader = async () => {
	const bookingSvc = new BookingService();
	const toursSvc = new ToursService();
	const authSvc = new AuthService();

	const [registrationsResp, toursResp, users] = await Promise.all([
		bookingSvc.getAllRegistrations(),
		toursSvc.getHighLevelTours(),
		authSvc.getAllUsers(),
	]);

	return {
		data: registrationsResp,
		tours: toursResp.tours,
		users: users.filter((u: any) => u.role !== "admin"),
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
		const paymentMode = formData.get("paymentMode") as string;

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
				const gender = formData.get("gender") as string;
				const dateOfBirth = formData.get("dateOfBirth") as string;

				const res = await authSvc.adminCreateUserAndProfile({
					firstName,
					lastName,
					email,
					aadharNumber,
					phone,
					gender,
					dateOfBirth,
				});
				if (!res.success) throw new Error(res.error);
				customerId = res.uid!;
			}

			await bookingSvc.adminCreateRegistration(
				tourId,
				customerId,
				travellersCount,
				notes,
				paymentMode,
			);
			return { success: true };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}

	if (intent === "update-payment-status") {
		const regId = formData.get("regId") as string;
		const status = formData.get("status") as string;
		const bookingSvc = new BookingService();

		try {
			await bookingSvc.updatePaymentStatus(regId, status);
			return { success: true, message: `Payment marked as ${status}` };
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
			toast.success(actionData.message || "Registration created successfully");
			setIsManualRegOpen(false);
		} else if (actionData?.error) {
			toast.error(actionData.error);
		}
	}, [actionData]);

	const handleExport = async () => {
		setIsExporting(true);
		try {
			const allEmails = data.registrations
				.map((reg) => reg.profileSnapshot?.email)
				.filter(Boolean)
				.join(", ");

			const exportData = data.registrations.map((reg: TourRegistration) => {
				let registrationDate = "N/A";
				if (reg.createdAt) {
					try {
						const dateObj =
							typeof (reg.createdAt as any).toDate === "function"
								? (reg.createdAt as any).toDate()
								: new Date(reg.createdAt as any);
						registrationDate = format(dateObj, "yyyy-MM-dd HH:mm");
					} catch (e) {
						console.error("Date formatting failed for registration:", reg.id, e);
					}
				}

				return {
					"Tour Name": reg.tours?.name || "N/A",
					"Tour Code": reg.tours?.tour_code || "N/A",
					"Customer Name": `${reg.profileSnapshot?.first_name || ""} ${reg.profileSnapshot?.last_name || ""}`,
					Email: reg.profileSnapshot?.email || "N/A",
					Phone: reg.profileSnapshot?.phone_number || "N/A",
					Travellers: reg.travellersCount,
					Status: reg.status,
					"Amount (INR)": (reg.tours?.price || 0) * reg.travellersCount || 0,
					"Registration Date": registrationDate,
					"ALL RECIPIENTS (BCC)": allEmails,
				};
			});

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
			header: "Pilgrimage Journey",
			cell: ({ row }) => (
				<div className="flex flex-col gap-0.5 py-1">
					<span className="font-bold text-foreground leading-tight">
						{row.original.tours?.name}
					</span>
					<span className="text-[10px] text-foreground/40 font-mono uppercase tracking-tighter">
						{row.original.tours?.tour_code}
					</span>
				</div>
			),
		},
		{
			id: "Customer",
			accessorKey: "profileSnapshot.first_name",
			header: "Pilgrim Details",
			cell: ({ row }) => (
				<div className="flex flex-col gap-0.5">
					<span className="font-bold text-foreground">
						{row.original.profileSnapshot?.first_name} {row.original.profileSnapshot?.last_name}
					</span>
					<div className="flex flex-col text-[10px] text-foreground/40 font-bold uppercase tracking-widest gap-0.5">
						<span>{row.original.profileSnapshot?.email}</span>
						<span>{row.original.profileSnapshot?.phone_number}</span>
					</div>
				</div>
			),
		},
		{
			id: "Aadhar",
			header: "Identity",
			cell: ({ row }) => (
				<span className="text-xs font-mono text-foreground/60">
					{maskAadhar(row.original.profileSnapshot?.aadhar_number)}
				</span>
			),
		},
		{
			id: "Travellers",
			accessorKey: "travellersCount",
			header: "Participants",
			cell: (info) => (
				<div className="text-center font-bold text-primary">
					{info.getValue() as number}
				</div>
			),
		},
		{
			id: "Date",
			accessorKey: "createdAt",
			header: "Reg. Date",
			cell: (info) => {
				const val = info.getValue();
				if (!val) return "N/A";
				try {
					const dateObj = typeof (val as any).toDate === "function" ? (val as any).toDate() : new Date(val as any);
					return (
						<div className="text-[10px] text-foreground/40 font-bold uppercase">
							{format(dateObj, "dd MMM yyyy")}
						</div>
					);
				} catch (e) {
					return <div className="text-[10px] text-foreground/40 font-bold uppercase">Invalid Date</div>;
				}
			},
		},
		{
			id: "Payment",
			accessorKey: "paymentMode",
			header: "Payment",
			cell: ({ row }) => (
				<div className="flex flex-col gap-1.5">
					<Badge
						variant="outline"
						className="text-[9px] font-bold uppercase tracking-widest border-primary/20 text-primary/60 w-fit"
					>
						{row.original.paymentMode || "CASH"}
					</Badge>
					<Badge
						className={cn(
							"px-2 py-0.5 rounded-full border shadow-none font-bold text-[8px] uppercase tracking-widest w-fit",
							row.original.paymentStatus === "PAID"
								? "text-emerald-600 border-emerald-500/20 bg-emerald-50"
								: "text-amber-600 border-amber-500/20 bg-amber-50",
						)}
					>
						{row.original.paymentStatus || "PENDING"}
					</Badge>
				</div>
			),
		},
		{
			id: "Amount",
			header: "Total Exchange",
			cell: ({ row }) => (
				<span className="font-serif text-lg text-primary font-bold">
					₹{((row.original.tours?.price || 0) * row.original.travellersCount).toLocaleString()}
				</span>
			),
		},
		{
			id: "Status",
			accessorKey: "status",
			header: "Status",
			cell: ({ row }) => (
				<Badge
					className={`px-3 py-1 rounded-full border shadow-none font-bold text-[9px] uppercase tracking-widest ${row.original.status === "CONFIRMED" ? "text-emerald-600 border-emerald-500/20 bg-emerald-50" : "text-primary border-primary/20 bg-primary/5"}`}
				>
					{row.original.status}
				</Badge>
			),
		},
		{
			id: "actions",
			cell: ({ row }) => (
				<DropdownMenu>
					<DropdownMenuTrigger asChild>
						<Button
							variant="ghost"
							className="h-10 w-10 p-0 rounded-full hover:bg-primary/5 transition-colors"
						>
							<MoreHorizontal className="h-5 w-5 text-foreground/40" />
						</Button>
					</DropdownMenuTrigger>
					<DropdownMenuContent
						align="end"
						className="w-52 rounded-2xl p-2 shadow-2xl bg-white border border-primary/10"
					>
						<DropdownMenuItem
							onClick={() => setSelectedReg(row.original)}
							className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5 font-medium"
						>
							View Full Details
						</DropdownMenuItem>

						{row.original.paymentStatus !== "PAID" ? (
							<DropdownMenuItem
								onClick={() => {
									const fd = new FormData();
									fd.append("intent", "update-payment-status");
									fd.append("regId", row.original.id);
									fd.append("status", "PAID");
									submit(fd, { method: "post" });
								}}
								className="rounded-xl cursor-pointer py-3 text-emerald-600 focus:bg-emerald-50 font-bold"
							>
								<CheckCircle2 className="mr-3 h-4 w-4" /> Mark as Paid
							</DropdownMenuItem>
						) : (
							<DropdownMenuItem
								onClick={() => {
									const fd = new FormData();
									fd.append("intent", "update-payment-status");
									fd.append("regId", row.original.id);
									fd.append("status", "PENDING");
									submit(fd, { method: "post" });
								}}
								className="rounded-xl cursor-pointer py-3 text-amber-600 focus:bg-amber-50 font-bold"
							>
								<Clock className="mr-3 h-4 w-4" /> Mark as Pending
							</DropdownMenuItem>
						)}

						<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-red-600 focus:bg-red-50 font-medium">
							Cancel Registration
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
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
		<div className="flex flex-1 flex-col gap-10 animate-in fade-in duration-700 max-w-7xl mx-auto">
			<MetaDetails
				metaTitle="Registrations | AMBADY Admin"
				metaDescription="Manage pilgrim registrations and journeys."
			/>

			<div className="flex flex-col md:flex-row justify-between items-end gap-8 border-b border-primary/10 pb-10">
				<div className="flex flex-col gap-6">
					<div className="flex items-center gap-4">
						<BackButton fallbackUrl="/admin" label="Dashboard" />
						<h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight leading-tight">
							Pilgrim Registrations
						</h1>
					</div>
					<p className="text-foreground/40 text-[10px] font-bold uppercase tracking-[0.3em] ml-2">
						Manage and track all spiritual journey participants.
					</p>
				</div>

				<div className="flex items-center gap-4 bg-primary/5 p-2 rounded-full border border-primary/10">
					<Button
						variant="ghost"
						className="rounded-full text-primary hover:bg-white hover:shadow-sm px-6 h-12 text-[9px] font-bold uppercase tracking-widest transition-all"
						onClick={() => setIsManualRegOpen(true)}
					>
						<Plus className="mr-2 h-4 w-4" /> Manual Entry
					</Button>
					<Button
						className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90 px-8 h-12 text-[9px] font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all"
						onClick={handleExport}
						disabled={isExporting || data.registrations.length === 0}
					>
						{isExporting ? (
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
						) : (
							<Download className="mr-2 h-4 w-4" />
						)}
						Excel Export
					</Button>
				</div>
			</div>

			<div className="bg-card rounded-[2.5rem] overflow-hidden shadow-xl border border-primary/10">
				{isFetching ? (
					<div className="p-12">
						<DataTableSkeleton noOfSkeletons={10} columns={tableColumns} />
					</div>
				) : (
					<div className="bg-card">
						<DataTable table={table} pageSize={10} total={data.total} onPageChange={() => {}} />
					</div>
				)}
			</div>

			{/* Manual Registration Dialog */}
			<Dialog open={isManualRegOpen} onOpenChange={setIsManualRegOpen}>
				<DialogContent className="max-w-2xl bg-white border-primary/10 text-foreground shadow-2xl rounded-[3rem] p-0 overflow-hidden max-h-[90vh] flex flex-col">
					<DialogHeader className="p-12 bg-primary/5 border-b border-primary/10 shrink-0">
						<DialogTitle className="text-3xl font-serif text-foreground">
							Manual Registration
						</DialogTitle>
						<DialogDescription className="text-primary text-[11px] font-bold uppercase tracking-[0.3em] mt-3">
							Assisting pilgrims with their sacred registration.
						</DialogDescription>
					</DialogHeader>

					<div className="flex-1 overflow-y-auto">
						<form onSubmit={handleManualSubmit} id="manual-reg-form" className="p-12 space-y-10">
							<div className="space-y-4">
								<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
									Select Pilgrimage Journey
								</Label>
								<Select name="tourId" required>
									<SelectTrigger className="h-14 bg-white border-primary/20 text-foreground rounded-2xl focus:ring-primary/20 shadow-sm">
										<SelectValue placeholder="Choose a pilgrimage journey" />
									</SelectTrigger>
									<SelectContent className="bg-white border-primary/20 text-foreground">
										{tours.map((t: any) => (
											<SelectItem key={t.id} value={t.id} className="focus:bg-primary/5">
												{t.name} ({t.tour_code})
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>

							<div className="space-y-6">
								<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
									Pilgrim Profile Mode
								</Label>
								<div className="grid grid-cols-2 gap-4 p-1.5 bg-primary/5 rounded-2xl border border-primary/10">
									<button
										type="button"
										onClick={() => setIsNewUser(false)}
										className={cn(
											"py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
											!isNewUser ? "bg-white text-primary shadow-sm" : "text-foreground/40 hover:text-foreground"
										)}
									>
										Existing Pilgrim
									</button>
									<button
										type="button"
										onClick={() => setIsNewUser(true)}
										className={cn(
											"py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all",
											isNewUser ? "bg-white text-primary shadow-sm" : "text-foreground/40 hover:text-foreground"
										)}
									>
										New Pilgrim
									</button>
								</div>
								<input type="hidden" name="isNewUser" value={isNewUser ? "true" : "false"} />
							</div>

							{isNewUser ? (
								<div className="space-y-8 animate-in fade-in slide-in-from-top-4 duration-500 bg-primary/[0.02] p-8 rounded-[2rem] border border-primary/10">
									<div className="grid grid-cols-2 gap-8">
										<div className="space-y-3">
											<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
												First Name
											</Label>
											<Input
												name="firstName"
												placeholder="First Name"
												required={isNewUser}
												className="h-14 bg-white border-primary/20 text-foreground rounded-2xl shadow-sm px-6"
											/>
										</div>
										<div className="space-y-3">
											<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
												Last Name
											</Label>
											<Input
												name="lastName"
												placeholder="Last Name"
												required={isNewUser}
												className="h-14 bg-white border-primary/20 text-foreground rounded-2xl shadow-sm px-6"
											/>
										</div>
									</div>
									<div className="grid grid-cols-2 gap-8">
										<div className="space-y-3">
											<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
												Email Address
											</Label>
											<Input
												name="email"
												type="email"
												placeholder="pilgrim@example.com"
												required={isNewUser}
												className="h-14 bg-white border-primary/20 text-foreground rounded-2xl shadow-sm px-6"
											/>
										</div>
										<div className="space-y-3">
											<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
												Phone Number
											</Label>
											<Input
												name="phone"
												placeholder="9876543210"
												required={isNewUser}
												className="h-14 bg-white border-primary/20 text-foreground rounded-2xl shadow-sm px-6"
											/>
										</div>
									</div>
									<div className="space-y-3">
										<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
											Aadhar Number (12 Digits)
										</Label>
										<Input
											name="aadharNumber"
											placeholder="0000 0000 0000"
											required={isNewUser}
											maxLength={12}
											className="h-14 bg-white border-primary/20 text-foreground rounded-2xl shadow-sm px-6"
										/>
									</div>

									<div className="grid grid-cols-2 gap-8">
										<div className="space-y-3">
											<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
												Gender
											</Label>
											<Select name="gender" required={isNewUser}>
												<SelectTrigger className="h-14 bg-white border-primary/20 text-foreground rounded-2xl focus:ring-primary/20 shadow-sm">
													<SelectValue placeholder="Select gender" />
												</SelectTrigger>
												<SelectContent className="bg-white border-primary/20 text-foreground">
													<SelectItem value="Male">Male</SelectItem>
													<SelectItem value="Female">Female</SelectItem>
													<SelectItem value="Other">Other</SelectItem>
												</SelectContent>
											</Select>
										</div>
										<div className="space-y-3">
											<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
												Date of Birth
											</Label>
											<Input
												name="dateOfBirth"
												type="date"
												required={isNewUser}
												className="h-14 bg-white border-primary/20 text-foreground rounded-2xl shadow-sm px-6"
											/>
										</div>
									</div>
									<p className="text-[9px] text-primary/60 font-bold uppercase tracking-widest text-center italic border border-primary/10 py-3 rounded-xl bg-white/50">
										Security Code will be generated automatically.
									</p>
								</div>
							) : (
								<div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-500">
									<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
										Select Existing Pilgrim
									</Label>
									<Select name="customerId" required={!isNewUser}>
										<SelectTrigger className="h-14 bg-white border-primary/20 text-foreground rounded-2xl focus:ring-primary/20 shadow-sm px-6">
											<SelectValue placeholder="Choose a pilgrim profile" />
										</SelectTrigger>
										<SelectContent className="bg-white border-primary/20 text-foreground">
											{users.map((u: any) => (
												<SelectItem
													key={u.uid}
													value={u.uid}
													className="focus:bg-primary/5"
												>
													{u.first_name} {u.last_name} ({u.email})
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}

							<div className="grid grid-cols-2 md:grid-cols-3 gap-8">
								<div className="space-y-4">
									<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
										Pilgrims Count
									</Label>
									<Input
										type="number"
										name="travellersCount"
										defaultValue={1}
										min={1}
										required
										className="h-14 bg-white border-primary/20 text-foreground rounded-2xl focus:ring-primary/20 shadow-sm px-8 font-serif text-2xl text-primary"
									/>
								</div>
								<div className="space-y-4">
									<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
										Payment Mode
									</Label>
									<Select name="paymentMode" defaultValue="CASH">
										<SelectTrigger className="h-14 bg-white border-primary/20 text-foreground rounded-2xl focus:ring-primary/20 shadow-sm px-6">
											<SelectValue />
										</SelectTrigger>
										<SelectContent className="bg-white border-primary/20 text-foreground">
											<SelectItem value="CASH">Cash</SelectItem>
											<SelectItem value="GPAY">GPay</SelectItem>
											<SelectItem value="OTHER_UPI">Other UPI</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-4">
									<Label className="text-[11px] font-bold uppercase tracking-[0.2em] text-foreground/40 ml-2">
										Administrative Notes
									</Label>
									<Input
										name="notes"
										placeholder="e.g. Needs assistance..."
										className="h-14 bg-white border-primary/20 text-foreground rounded-2xl focus:ring-primary/20 shadow-sm px-6"
									/>
								</div>
							</div>
						</form>
					</div>

					<div className="p-12 bg-primary/5 border-t border-primary/10 flex justify-end gap-6 shrink-0">
						<Button
							type="button"
							variant="ghost"
							onClick={() => setIsManualRegOpen(false)}
							className="text-foreground/40 hover:text-foreground h-12 uppercase tracking-widest font-bold text-[10px]"
						>
							Discard
						</Button>
						<Button
							form="manual-reg-form"
							type="submit"
							disabled={isSubmitting}
							className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-[11px] px-12 h-16 rounded-full shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
						>
							{isSubmitting ? (
								<Loader2 className="mr-3 h-5 w-5 animate-spin" />
							) : (
								"Complete Registration"
							)}
						</Button>
					</div>
				</DialogContent>
			</Dialog>

			{/* Registration Details View */}
			<Dialog open={!!selectedReg} onOpenChange={() => setSelectedReg(null)}>
				{selectedReg && (
					<DialogContent className="max-w-2xl bg-white border-primary/10 text-foreground shadow-2xl rounded-[3rem] p-0 overflow-hidden">
						<DialogHeader className="p-12 bg-primary/5 border-b border-primary/10">
							<DialogTitle className="text-4xl font-serif text-foreground">
								Registration Profile
							</DialogTitle>
							<DialogDescription className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary mt-3">
								Full details for registration on {selectedReg.tours?.name}
							</DialogDescription>
						</DialogHeader>

						<div className="p-12 space-y-10">
							<div className="grid md:grid-cols-2 gap-10">
								<div className="space-y-6">
									<h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
										<User className="h-5 w-5" /> Pilgrim Identity
									</h4>
									<div className="space-y-4 bg-background p-8 rounded-[2rem] border border-primary/10 shadow-sm">
										<div className="space-y-1">
											<p className="text-foreground/40 font-bold uppercase text-[9px] tracking-widest">
												Full Name
											</p>{" "}
											<p className="font-serif text-2xl text-foreground">
												{selectedReg.profileSnapshot?.first_name}{" "}
												{selectedReg.profileSnapshot?.last_name}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-foreground/40 font-bold uppercase text-[9px] tracking-widest">
												Email Contact
											</p>{" "}
											<p className="text-sm font-medium">
												{selectedReg.profileSnapshot?.email}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-foreground/40 font-bold uppercase text-[9px] tracking-widest">
												Phone Secure
											</p>{" "}
											<p className="text-sm font-medium">
												{selectedReg.profileSnapshot?.phone_number}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-foreground/40 font-bold uppercase text-[9px] tracking-widest">
												Aadhar Identity
											</p>{" "}
											<p className="font-mono text-sm tracking-wider">
												{maskAadhar(selectedReg.profileSnapshot?.aadhar_number)}
											</p>
										</div>
									</div>
								</div>

								<div className="space-y-6">
									<h4 className="text-[11px] font-bold uppercase tracking-[0.2em] text-primary flex items-center gap-3">
										<MapPin className="h-5 w-5" /> Pilgrimage Base
									</h4>
									<div className="space-y-4 bg-background p-8 rounded-[2rem] border border-primary/10 shadow-sm">
										<div className="space-y-1">
											<p className="text-foreground/40 font-bold uppercase text-[9px] tracking-widest">
												Current Residency
											</p>
											<p className="leading-relaxed text-sm font-medium">
												{selectedReg.profileSnapshot?.address_house},{" "}
												{selectedReg.profileSnapshot?.address_street}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-foreground/40 font-bold uppercase text-[9px] tracking-widest">
												Location Identity
											</p>
											<p className="text-sm font-medium">
												{selectedReg.profileSnapshot?.address_locality || "N/A"}
											</p>
										</div>
										<div className="space-y-1">
											<p className="text-foreground/40 font-bold uppercase text-[9px] tracking-widest">
												Country Profile
											</p>
											<p className="text-sm font-medium">
												{selectedReg.profileSnapshot?.country || "Not Provided"}
											</p>
										</div>
									</div>
								</div>
							</div>

							<div className="flex justify-end gap-6 pt-6 border-t border-primary/5">
								<Button
									variant="ghost"
									onClick={() => setSelectedReg(null)}
									className="text-foreground/40 hover:text-foreground h-12 uppercase tracking-widest font-bold text-[10px]"
								>
									Close Profile
								</Button>
								<Button className="bg-primary text-primary-foreground hover:bg-primary/90 font-bold uppercase tracking-widest text-[11px] px-14 h-16 rounded-full shadow-2xl shadow-primary/20 hover:scale-105 transition-all">
									Confirm Verification
								</Button>
							</div>
						</div>
					</DialogContent>
				)}
			</Dialog>
		</div>
	);
}
