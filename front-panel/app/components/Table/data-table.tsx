import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import {
	ColumnDef,
	flexRender,
	getCoreRowModel,
	Row,
	type Table,
	useReactTable,
} from "@tanstack/react-table";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import {
	Table as TableComponent,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "~/components/ui/table";
import { Skeleton } from "~/components/ui/skeleton";
import { cn } from "@workspace/shared/utils/ui";
import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Settings2 } from "lucide-react";
import { type JSX, memo, useCallback } from "react";
import { Checkbox } from "~/components/ui/checkbox";

interface DataTableProps {
	table: Table<any>;
	onPageChange?: (page: number) => void;
	onPageSizeChange?: (pageSize: number) => void;
	pageSize?: number;
	total?: number;
	customEmptyMessage?: string;
	cellClassName?: string;
	headerClassName?: string;
}

export interface DataTableViewOptionsProps<T> {
	table: Table<T>;
	disabled: boolean;
}

export interface DataTableSkeletonProps {
	noOfSkeletons: number;
	columns: ColumnDef<any>[];
}

export const DataTable = ({
	table,
	onPageChange,
	onPageSizeChange,
	pageSize,
	total,
	customEmptyMessage,
	cellClassName = "",
	headerClassName = "bg-primary/5 text-primary",
}: DataTableProps) => {
	if (!table) {
		return (
			<div className="p-8 text-center text-foreground/40 font-bold uppercase tracking-widest text-[10px]">
				Table not initialized.
			</div>
		);
	}

	const PAGE_VALUES = [10, 20, 30, 40, 50];

	return (
		<section className="bg-card">
			<TableComponent>
				<TableHeader className="sticky top-0 z-10 border-b border-primary/10">
					{table.getHeaderGroups().map((headerGroup) => (
						<TableRow
							key={headerGroup.id}
							className="*:whitespace-nowrap sticky top-0 bg-primary/5 after:content-[''] after:inset-x-0 after:h-px after:bg-primary/10 after:absolute after:bottom-0"
						>
							{headerGroup.headers.map((header, index) => {
								const isFirst = index === 0;
								const isLast = index === headerGroup.headers.length - 1;

								return (
									<TableHead
										key={header.id}
										className={cn(
											"text-[10px] font-bold uppercase tracking-[0.2em] py-5 px-6",
											headerClassName,
											isFirst && "pl-8",
											isLast && "pr-8",
										)}
									>
										{header.isPlaceholder
											? null
											: flexRender(header.column.columnDef.header, header.getContext())}
									</TableHead>
								);
							})}
						</TableRow>
					))}
				</TableHeader>
				<TableBody
					className={cn(
						"**:data-[slot=table-cell]:last:sticky **:data-[slot=table-cell]:last:right-0 **:data-[slot=table-cell]:last:z-10",
						cellClassName,
					)}
				>
					{table.getRowModel().rows?.length > 0 ? (
						table.getRowModel().rows.map((row) => (
							<TableRow
								key={row.id}
								id={row.id}
								data-state={row.getIsSelected() && "selected"}
								data-slot="table-row"
								className="hover:bg-primary/[0.02] data-[state=selected]:bg-primary/5 border-b border-primary/5 transition-colors"
							>
								{row.getVisibleCells().map((cell, idx) => (
									<TableCell
										key={cell.id}
										className={cn(
											"py-5 px-6 text-foreground font-medium",
											idx === 0 && "pl-8",
											idx === row.getVisibleCells().length - 1 && "pr-8",
										)}
									>
										{flexRender(cell.column.columnDef.cell, cell.getContext())}
									</TableCell>
								))}
							</TableRow>
						))
					) : (
						<TableRow>
							<TableCell
								colSpan={table.getAllColumns().length}
								className="h-64 text-center select-none"
							>
								<div className="flex flex-col items-center justify-center gap-6 opacity-20">
									<Settings2 className="h-12 w-12 text-primary" />
									<p className="text-[11px] font-bold uppercase tracking-[0.4em] text-primary">
										{customEmptyMessage ?? "No Sacred Records Found"}
									</p>
								</div>
							</TableCell>
						</TableRow>
					)}
				</TableBody>
			</TableComponent>

			{/* Pagination */}
			<div className="py-6 px-8 border-t border-primary/10">
				<div className="flex flex-col sm:flex-row items-center justify-between gap-6">
					<div className="flex items-center gap-8">
						<p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
							{ShowTotalMessage(total)}
						</p>

						{onPageSizeChange && pageSize && (
							<div className="flex items-center gap-3">
								<Label
									htmlFor="rows-per-page"
									className="text-[10px] font-bold uppercase tracking-widest text-foreground/40"
								>
									Rows:
								</Label>
								<Select
									value={`${pageSize}`}
									onValueChange={(value) => onPageSizeChange(Number(value))}
								>
									<SelectTrigger
										size="sm"
										className="w-20 h-8 rounded-lg border-primary/20 bg-white"
										id="rows-per-page"
									>
										<SelectValue placeholder={table.getState().pagination.pageSize} />
									</SelectTrigger>
									<SelectContent side="top">
										{PAGE_VALUES.map((size) => (
											<SelectItem key={size} value={`${size}`}>
												{size}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						)}
					</div>

					<div className="flex items-center gap-6">
						<div className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
							Page {table.getState().pagination.pageIndex + 1} / {table.getPageCount() || 1}
						</div>

						{onPageChange && (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									className="size-8 rounded-lg border-primary/20 hover:bg-primary/5"
									size="icon"
									onClick={() => onPageChange(table.getState().pagination.pageIndex - 1)}
									disabled={!table.getCanPreviousPage()}
								>
									<IconChevronLeft className="size-4" />
								</Button>
								<Button
									variant="outline"
									className="size-8 rounded-lg border-primary/20 hover:bg-primary/5"
									size="icon"
									onClick={() => onPageChange(table.getState().pagination.pageIndex + 1)}
									disabled={!table.getCanNextPage()}
								>
									<IconChevronRight className="size-4" />
								</Button>
							</div>
						)}
					</div>
				</div>
			</div>
		</section>
	);
};

function ShowTotalMessage(total: number | undefined) {
	switch (total) {
		case 0:
		case undefined:
			return "No records found";
		default:
			return `(${total}) record${total === 1 ? "" : "s"} found`;
	}
}

export const DataTableSkeleton = memo(function DataTableSkeleton({
	noOfSkeletons = 8,
	columns,
}: DataTableSkeletonProps) {
	const table = useReactTable({
		data: [],
		columns,
		getCoreRowModel: getCoreRowModel(),
	});

	return (
		<TableComponent>
			<TableHeader className="bg-primary/5 sticky top-0 z-10 border-b border-primary/10">
				{table.getHeaderGroups().map((headerGroup) => (
					<TableRow key={headerGroup.id}>
						{headerGroup.headers.map((header) => {
							return (
								<TableHead
									key={header.id}
									className="text-[10px] font-bold uppercase tracking-[0.2em] py-5 px-6 text-primary"
								>
									{header.isPlaceholder
										? null
										: flexRender(header.column.columnDef.header, header.getContext())}
								</TableHead>
							);
						})}
					</TableRow>
				))}
			</TableHeader>
			<TableBody className="**:data-[slot=table-cell]:first:w-8">
				{Array.from({ length: noOfSkeletons }, (_, i) => i + 1).map((i) => (
					<TableRow key={i} className="border-b border-primary/5">
						{Array.from({ length: columns.length }, (_, i) => i + 1).map((index) => {
							return (
								<TableCell key={index + index} className="py-5 px-6">
									<Skeleton className="h-5 w-full bg-primary/5 rounded-lg" />
								</TableCell>
							);
						})}
					</TableRow>
				))}
			</TableBody>
		</TableComponent>
	);
});

export function TableColumnsToggle({ table }: { table: Table<any> }) {
	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild>
				<Button
					variant="outline"
					size="sm"
					className="h-8 flex cursor-pointer select-none dark:hover:bg-muted"
				>
					<Settings2 />
					<span className="hidden md:inline">Columns</span>
				</Button>
			</DropdownMenuTrigger>
			<DropdownMenuContent align="end" className="w-37.5">
				<DropdownMenuLabel>Toggle Columns</DropdownMenuLabel>
				<DropdownMenuSeparator />
				{table
					.getAllColumns()
					.filter((column: any) => typeof column.accessorFn !== "undefined" && column.getCanHide())
					.map((column: any) => {
						return (
							<DropdownMenuCheckboxItem
								key={column.id}
								className="cursor-pointer"
								checked={column.getIsVisible()}
								onCheckedChange={(value) => column.toggleVisibility(!!value)}
							>
								{column.id}
							</DropdownMenuCheckboxItem>
						);
					})}
			</DropdownMenuContent>
		</DropdownMenu>
	);
}

interface TableRowSelectorProps<TableValues extends Record<string, any>> {
	name: keyof TableValues;
}

export function TableRowSelector<TableValues extends Record<string, any>>({
	name,
}: TableRowSelectorProps<TableValues>) {
	const header = useCallback(
		({ table }: { table: Table<TableValues[typeof name]> }): JSX.Element | null => {
			const rows = table.getRowCount();
			return rows > 0 ? (
				<div className="flex items-center justify-center mr-2 ml-1">
					<Checkbox
						checked={
							table.getIsAllPageRowsSelected() ||
							(table.getIsSomePageRowsSelected() && "indeterminate")
						}
						onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
						aria-label="Select all"
					/>
				</div>
			) : null;
		},
		[],
	);

	const cell = useCallback(({ row }: { row: Row<TableValues[typeof name]> }): JSX.Element => {
		return (
			<div className="flex items-center justify-center mr-2 ml-1">
				<Checkbox
					checked={row.getIsSelected()}
					onCheckedChange={(value) => row.toggleSelected(!!value)}
					aria-label="Select row"
				/>
			</div>
		);
	}, []);

	return { header, cell };
}
