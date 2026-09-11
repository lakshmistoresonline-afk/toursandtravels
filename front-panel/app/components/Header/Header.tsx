import { Form, Link, NavLink, useNavigation, useRouteLoaderData } from "react-router";
import { Menu, LogIn, LogOutIcon, Loader2, Info, Calendar, LayoutDashboard, Compass } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTrigger } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { clientLoader as loader } from "~/root";
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
	{ label: "About", to: "/about" },
	{ label: "Contact", to: "/contact-us" },
];

export default function Header() {
	const rootLoaderData = useRouteLoaderData<typeof loader>("root");
	const user = rootLoaderData?.user as FullCurrentUser | null;

	return (
		<header className="bg-[#0a0e1a]/80 backdrop-blur-md border-b border-[#d4af37]/10 sticky top-0 z-50">
			<div className="container mx-auto flex items-center h-20 px-4">
				{/* Mobile menu */}
				<div className="mr-4 lg:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="rounded-full text-[#d4af37]"><Menu className="h-5 w-5" /></Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-[280px] bg-[#0a0e1a] border-r border-[#d4af37]/10">
							<nav className="flex flex-col gap-6 mt-12">
								{NAV_LINKS.map((link) => (
									<NavLink key={link.to} to={link.to} prefetch="intent" className={({ isActive }) => `text-sm font-bold uppercase tracking-widest transition-all ${isActive ? "text-[#d4af37]" : "text-[#fdfcf0]/60 hover:text-[#d4af37]"}`}>
										{link.label}
									</NavLink>
								))}
							</nav>
						</SheetContent>
					</Sheet>
				</div>

				<Link to="/" className="flex items-center gap-3">
					<Compass className="h-6 w-6 text-[#d4af37]" />
					<span className="text-xl font-display font-bold tracking-widest text-[#d4af37]">AMBADY</span>
				</Link>

				<nav className="ml-12 hidden lg:flex items-center gap-8">
					{NAV_LINKS.map((link) => (
						<NavLink key={link.to} to={link.to} prefetch="intent" className={({ isActive }) => `text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-[#d4af37] ${isActive ? "text-[#d4af37]" : "text-[#fdfcf0]/60"}`}>
							{link.label}
						</NavLink>
					))}
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
			<Button size="sm" className="rounded-full font-bold px-6 bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] text-[9px] uppercase tracking-widest shadow-lg shadow-[#d4af37]/10" asChild>
				<Link to="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<div className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors">
					<Avatar className="h-8 w-8 border border-[#d4af37]/30">
						<AvatarImage src={user.avatar_url} />
						<AvatarFallback className="bg-[#d4af37] text-[#0a0e1a] font-bold text-xs">{user.first_name?.charAt(0) ?? "A"}</AvatarFallback>
					</Avatar>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-56 rounded-2xl p-2 bg-[#0a0e1a] border border-[#d4af37]/10 shadow-2xl" align="end" sideOffset={8}>
				<DropdownMenuLabel className="px-4 py-3">
					<p className="text-[10px] font-bold text-[#fdfcf0] truncate tracking-wide">{user.email}</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-[#d4af37]/10" />
				<DropdownMenuGroup>
					<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 text-[10px] uppercase tracking-widest text-[#fdfcf0]/70 focus:bg-[#d4af37]/10">
						<Link to="/account/details">Profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 text-[10px] uppercase tracking-widest text-[#fdfcf0]/70 focus:bg-[#d4af37]/10">
						<Link to="/account/bookings">Journeys</Link>
					</DropdownMenuItem>
					{user.role === "admin" && (
						<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-2.5 text-[10px] uppercase tracking-widest bg-[#d4af37]/5 text-[#d4af37] focus:bg-[#d4af37]/10">
							<Link to="/admin">Dashboard</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="bg-[#d4af37]/10" />
				<Form action="/logout" method="POST" className="p-1">
					<button type="submit" className="w-full">
						<DropdownMenuItem variant="destructive" className="rounded-xl cursor-pointer py-2.5 text-[10px] uppercase tracking-widest text-red-400">
							{isLoggingOut ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
							Logout
						</DropdownMenuItem>
					</button>
				</Form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
