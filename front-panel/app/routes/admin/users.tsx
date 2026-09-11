import { ColumnDef, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, User, Mail, Phone, Calendar, Search, ShieldCheck } from "lucide-react";
import { useLoaderData, useNavigation, useLocation, Form } from "react-router";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { DataTable, DataTableSkeleton } from "~/components/Table/data-table";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { AuthService } from "@workspace/shared/services/auth.service";
import { maskAadhar } from "@workspace/shared/utils/ui";
import type { AppUser } from "@workspace/shared/types/user";

export const clientLoader = async ({ request }: any) => {
	const url = new URL(request.url);
	const q = url.searchParams.get("q") || "";
	const authSvc = new AuthService();
	const users = await authSvc.getAllUsers();

	// Filter in memory for simplicity on Spark plan
	const filteredUsers = users.filter((u) => {
		if (!q) return true;
		const search = q.toLowerCase();
		return (
			u.first_name?.toLowerCase().includes(search) ||
			u.last_name?.toLowerCase().includes(search) ||
			u.email?.toLowerCase().includes(search) ||
			u.phone_number?.toLowerCase().includes(search)
		);
	});

	return { users: filteredUsers, query: q };
};

export default function AdminUsersPage() {
	const { users, query } = useLoaderData<typeof clientLoader>();
	const navigation = useNavigation();
	const location = useLocation();

	const isFetching = navigation.state === "loading" && navigation.location?.pathname === location.pathname;

	const columns: ColumnDef<AppUser, unknown>[] = [
		{
			id: "Pilgrim",
			header: "Pilgrim Identity",
			cell: ({ row }) => (
				<div className="flex items-center gap-4 py-1">
					<div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
						<User className="h-6 w-6" />
					</div>
					<div className="space-y-0.5">
						<div className="font-bold text-foreground leading-tight text-lg">
							{row.original.first_name} {row.original.last_name}
						</div>
						<div className="flex items-center gap-2">
							<Badge
								variant="outline"
								className="text-[8px] uppercase tracking-widest bg-primary/5 border-primary/20 text-primary"
							>
								{row.original.role}
							</Badge>
							{row.original.status === "active" && (
								<div className="flex items-center gap-1 text-[8px] text-emerald-600 font-bold uppercase tracking-widest">
									<ShieldCheck className="h-2.5 w-2.5" /> Verified
								</div>
							)}
						</div>
					</div>
				</div>
			),
		},
		{
			id: "Identity",
			header: "Sacred Identity",
			cell: ({ row }) => (
				<div className="space-y-1">
					<p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest">
						Aadhaar
					</p>
					<p className="font-mono text-xs tracking-wider">
						{maskAadhar(row.original.aadhar_number)}
					</p>
				</div>
			),
		},
		{
			id: "Contact",
			header: "Contact Details",
			cell: ({ row }) => (
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-xs text-foreground/70 font-medium">
						<Mail className="h-3.5 w-3.5 text-primary/50" />
						{row.original.email}
					</div>
					<div className="flex items-center gap-2 text-xs text-foreground/70 font-medium">
						<Phone className="h-3.5 w-3.5 text-primary/50" />
						{row.original.phone_number || "No Phone"}
					</div>
				</div>
			),
		},
		{
			id: "Joined",
			header: "Member Since",
			cell: ({ row }) => {
				const date = row.original.createdAt;
				let displayDate = "N/A";
				if (date) {
					try {
						const dateObj = typeof (date as any).toDate === "function" ? (date as any).toDate() : new Date(date as any);
						displayDate = format(dateObj, "dd MMM yyyy");
					} catch (e) {
						displayDate = "Invalid Date";
					}
				}
				return (
					<div className="flex items-center gap-2 text-foreground/40 font-bold uppercase text-[10px] tracking-widest">
						<Calendar className="h-3.5 w-3.5 text-primary/30" />
						{displayDate}
					</div>
				);
			},
		},
		{
			id: "actions",
			cell: () => (
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
						<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5 font-medium">
							View Activity
						</DropdownMenuItem>
						<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-foreground/80 focus:bg-primary/5 font-medium">
							Edit Profile
						</DropdownMenuItem>
						<DropdownMenuItem className="rounded-xl cursor-pointer py-3 text-red-600 focus:bg-red-50 font-medium">
							Suspend Access
						</DropdownMenuItem>
					</DropdownMenuContent>
				</DropdownMenu>
			),
		},
	];

	const table = useReactTable({
		data: users ?? [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-7xl mx-auto">
			<MetaDetails
				metaTitle="Pilgrim Inventory | AMBADY Admin"
				metaDescription="Manage all registered pilgrims in the sacred community."
			/>

			<div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-8 border-b border-primary/10 pb-8">
				<div>
					<h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight">
						Pilgrim Inventory
					</h1>
					<p className="text-foreground/40 mt-3 text-sm uppercase tracking-[0.2em] font-bold">
						Manage and oversee all members of the AMBADY community.
					</p>
				</div>
			</div>

			<div className="bg-card rounded-[2.5rem] overflow-hidden shadow-xl border border-primary/10">
				<div className="p-8 border-b border-primary/10 bg-primary/5">
					<Form method="get" className="relative w-full md:w-[450px]">
						<Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-primary/60" />
						<Input
							name="q"
							placeholder="Search pilgrims by name, email or phone..."
							className="h-14 pl-14 rounded-2xl bg-white border-primary/20 text-foreground focus-visible:ring-primary/20 placeholder:text-foreground/30 shadow-sm"
							defaultValue={query}
						/>
					</Form>
				</div>

				{isFetching ? (
					<div className="p-12">
						<DataTableSkeleton noOfSkeletons={10} columns={columns} />
					</div>
				) : (
					<DataTable table={table} total={users.length} pageSize={10} onPageChange={() => {}} />
				)}
			</div>
		</div>
	);
}
