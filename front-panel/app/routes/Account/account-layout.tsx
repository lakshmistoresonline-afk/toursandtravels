import { type LoaderFunctionArgs, Outlet, redirect } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Link } from "react-router";
import { User, Calendar } from "lucide-react";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export const clientLoader = async ({ request }: LoaderFunctionArgs) => {
	const { user } = await getCurrentUser(request);
	if (!user) return redirect("/login");
	return null;
};

export default function AccountLayout() {
	return (
		<div className="container py-8 px-4">
			<div className="grid gap-8 md:grid-cols-[220px_1fr]">
				<aside className="flex flex-col gap-4">
					<Card>
						<CardHeader><CardTitle className="text-lg">My Account</CardTitle></CardHeader>
						<CardContent className="p-0">
							<nav className="flex flex-col">
								<Link to="/account/details" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent border-b">
									<User className="w-4 h-4" /> Account Details
								</Link>
								<Link to="/account/bookings" className="flex items-center gap-3 px-4 py-3 text-sm hover:bg-accent">
									<Calendar className="w-4 h-4" /> My Bookings
								</Link>
							</nav>
						</CardContent>
					</Card>
				</aside>
				<main><Outlet /></main>
			</div>
		</div>
	);
}
