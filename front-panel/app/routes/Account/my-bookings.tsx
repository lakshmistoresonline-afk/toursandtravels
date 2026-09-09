import { useLoaderData, useSearchParams, redirect, type LoaderFunctionArgs } from "react-router";
import { format } from "date-fns";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { genAuthSecurity } from "@workspace/shared/utils/auth-utils.server";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import type { Database } from "@workspace/shared/types/supabase";
import { myRegistrationsQuery } from "~/queries/registrations.q";
import { MetaDetails } from "~/components/SEO/MetaDetails";

const PAGE_SIZE = 10;

export const loader = async ({ request }: LoaderFunctionArgs) => {
	const { authId } = genAuthSecurity(request);
	if (!authId) return redirect("/login");

	const userResult = await getCurrentUser(request);
	if (!userResult.user) return redirect("/login");

	const url = new URL(request.url);
	const currentPage = Number(url.searchParams.get("page")) || 1;
	const pageIndex = Math.max(0, currentPage - 1);

	try {
		const result = await myRegistrationsQuery({ pageIndex, pageSize: PAGE_SIZE, request });
		return { registrationsData: result, currentPage };
	} catch (error) {
		console.error(error);
		return {
			registrationsData: { registrations: [], total: 0 },
			currentPage,
			errorMessage: "Failed to load registrations.",
		};
	}
};

export default function MyBookingsPage() {
	const { registrationsData, currentPage, errorMessage } = useLoaderData<typeof loader>();
	const { registrations, total } = registrationsData;
	const totalPages = Math.ceil(total / PAGE_SIZE);
	const [_, setSearchParams] = useSearchParams();

	const handlePageChange = (newPage: number) => {
		setSearchParams((prev) => {
			const p = new URLSearchParams(prev);
			p.set("page", String(newPage));
			return p;
		});
	};

	return (
		<>
			<MetaDetails
				metaTitle="My Tours | WanderNest"
				metaDescription="View your tour registrations"
				metaKeywords="WanderNest"
			/>
			<div className="container mx-auto max-w-5xl">
				<div className="mb-8">
					<h1 className="text-3xl font-bold tracking-tight">My Tours</h1>
					<p className="text-muted-foreground mt-1">View and manage your tour registrations</p>
				</div>

				{errorMessage && <div className="text-destructive mb-4">{errorMessage}</div>}

				{registrations.length === 0 ? (
					<Card>
						<CardContent className="py-12 text-center text-muted-foreground">
							You haven't registered for any tours yet.
						</CardContent>
					</Card>
				) : (
					<div className="space-y-4">
						{registrations.map((reg: any) => (
							<Card key={reg.id}>
								<div className="p-6">
									<div className="flex flex-col md:flex-row justify-between gap-4">
										<div className="space-y-2">
											<div className="flex items-center gap-3">
												<h3 className="text-xl font-semibold">{reg.tours?.name}</h3>
												<Badge variant={reg.status === 'CONFIRMED' ? 'default' : reg.status === 'PENDING' ? 'warning' : 'destructive'}>
													{reg.status}
												</Badge>
											</div>
											<div className="text-sm text-muted-foreground">
												{reg.tours?.destination} • {reg.tours?.start_date ? format(new Date(reg.tours.start_date), "PPP") : 'Date TBD'}
											</div>
											<div className="text-sm">
												Registered on: {format(new Date(reg.registration_date), "PPP")}
											</div>
										</div>
										<div className="flex flex-col md:items-end gap-2">
											<div className="text-lg font-bold">
												{reg.travellers_count} Travellers
											</div>
											<div className="text-sm text-muted-foreground">
												Total: {(reg.tours?.price * reg.travellers_count).toLocaleString()} AED
											</div>
										</div>
									</div>
								</div>
							</Card>
						))}
					</div>
				)}

				{totalPages > 1 && (
					<div className="mt-8 flex justify-center items-center gap-4">
						<Button variant="outline" size="sm" disabled={currentPage === 1} onClick={() => handlePageChange(currentPage - 1)}>
							<ChevronLeft className="h-4 w-4 mr-1" /> Previous
						</Button>
						<span className="text-sm">Page {currentPage} of {totalPages}</span>
						<Button variant="outline" size="sm" disabled={currentPage >= totalPages} onClick={() => handlePageChange(currentPage + 1)}>
							Next <ChevronRight className="h-4 w-4 ml-1" />
						</Button>
					</div>
				)}
			</div>
		</>
	);
}

// Helper components remain unchanged
function BookingStatusBadge({ status }: { status: Database["public"]["Enums"]["booking_status_enum"] }) {
	const variants: Record<string, "default" | "secondary" | "destructive" | "warning"> = {
		CONFIRMED: "default",
		PENDING: "warning",
		CANCELLED: "destructive",
	};

	return (
		<Badge variant={variants[status] || "outline"} className="capitalize">
			{status.toLowerCase()}
		</Badge>
	);
}

function PaymentStatusBadge({ status }: { status: Database["public"]["Enums"]["payment_status_enum"] }) {
	const variants: Record<string, "default" | "secondary" | "destructive" | "warning"> = {
		PAID: "default",
		UNPAID: "warning",
		REFUNDED: "destructive",
		PENDING: "warning",
		PARTIAL: "warning",
	};

	return (
		<Badge variant={variants[status] || "outline"} className="capitalize text-xs">
			{status.toLowerCase()}
		</Badge>
	);
}
