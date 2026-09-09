import { Form, Link, NavLink, useNavigation, useRouteLoaderData } from "react-router";
import { Menu, LogIn, LogOutIcon, Loader2, Info, Calendar, LayoutDashboard } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { loader } from "~/root";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuGroup,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar";
import type { FullCurrentUser } from "@workspace/shared/types/user";

const NAV_LINKS = [
	{ label: "Home", to: "/" },
	{ label: "All Tours", to: "/tours" },
	{ label: "About", to: "/about" },
	{ label: "FAQs", to: "/faqs" },
];

export default function Header() {
	const rootLoaderData = useRouteLoaderData<typeof loader>("root");
	const user = rootLoaderData?.user as FullCurrentUser | null;

	return (
		<header className="bg-background border-b">
			<div className="container mx-auto flex items-center h-16 px-4">
				{/* Mobile menu */}
				<div className="mr-2 flex lg:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon"><Menu className="h-5 w-5" /></Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-64">
							<SheetHeader className="mt-5"><span className="text-lg font-semibold">WanderNest</span></SheetHeader>
							<nav className="flex flex-col gap-4 mt-8">
								{NAV_LINKS.map((link) => (
									<NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm ${isActive ? "font-medium" : "text-muted-foreground"}`}>
										{link.label}
									</NavLink>
								))}
								{user?.role === "admin" && (
									<NavLink to="/admin" className="text-sm text-primary font-bold">Admin Dashboard</NavLink>
								)}
							</nav>
						</SheetContent>
					</Sheet>
				</div>

				<Link to="/" className="flex items-center gap-2">
					<span className="text-xl font-bold tracking-tight">WanderNest</span>
				</Link>

				<nav className="ml-12 hidden lg:flex items-center gap-6">
					{NAV_LINKS.map((link) => (
						<NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm hover:text-primary transition-colors ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>
							{link.label}
						</NavLink>
					))}
					{user?.role === "admin" && (
						<NavLink to="/admin" className="text-sm text-primary font-bold hover:opacity-80">Admin Dashboard</NavLink>
					)}
				</nav>

				<div className="flex-1" />

				<UserAccountButton user={user} />
			</div>
		</header>
	);
}

function UserAccountButton({ user }: { user: FullCurrentUser | null }) {
	const navigation = useNavigation();

	const isLoggingOut = navigation.state === "submitting" && navigation.formAction === "/logout";

	if (!user) {
		return (
			<Button size="sm" asChild>
				<Link to="/login"><LogIn className="mr-2 h-4 w-4" /> Login</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<Avatar className="h-9 w-9 border">
					<AvatarImage src={user.avatar_url ?? undefined} />
					<AvatarFallback>{user.first_name?.charAt(0) ?? "U"}</AvatarFallback>
				</Avatar>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56" align="end">
				<DropdownMenuLabel>👋 Welcome, {user.first_name}</DropdownMenuLabel>
				<DropdownMenuSeparator />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild><Link to="/account/details"><Info className="mr-2 h-4 w-4" /> Account Details</Link></DropdownMenuItem>
					<DropdownMenuItem asChild><Link to="/account/bookings"><Calendar className="mr-2 h-4 w-4" /> My Bookings</Link></DropdownMenuItem>
					{user.role === "admin" && (
						<DropdownMenuItem asChild><Link to="/admin"><LayoutDashboard className="mr-2 h-4 w-4" /> Admin Panel</Link></DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator />
				<Form action="/logout" method="POST">
					<button type="submit" className="w-full">
						<DropdownMenuItem variant="destructive" className="cursor-pointer">
							{isLoggingOut ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <LogOutIcon className="mr-2 h-4 w-4" />}
							Logout
						</DropdownMenuItem>
					</button>
				</Form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
