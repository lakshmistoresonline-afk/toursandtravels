import { Form, Link, NavLink, useNavigation, useRouteLoaderData } from "react-router";
import { Menu, LogIn, LogOutIcon, Loader2, Info, Calendar, LayoutDashboard } from "lucide-react";
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

const logo = "/brand/amady-logo.png";

const NAV_LINKS = [
	{ label: "Home", to: "/" },
	{ label: "Pilgrimage Journeys", to: "/tours" },
	{ label: "About", to: "/about" },
	{ label: "Contact", to: "/contact-us" },
];

export default function Header() {
	const rootLoaderData = useRouteLoaderData<typeof loader>("root");
	const user = rootLoaderData?.user as FullCurrentUser | null;

	return (
		<header className="bg-[#0a0e1a]/60 backdrop-blur-xl border-b border-[#d4af37]/20 sticky top-0 z-50">
			<div className="container mx-auto flex items-center h-24 px-4">
				{/* Mobile menu */}
				<div className="mr-4 lg:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="rounded-xl hover:bg-[#d4af37]/10 text-[#d4af37]"><Menu className="h-6 w-6" /></Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-[300px] bg-[#0a0e1a] border-r border-[#d4af37]/20">
							<SheetHeader className="mt-8">
								<div className="flex items-center gap-3">
									<img src={logo} alt="Amady" className="h-12 w-12 object-contain" />
									<div className="text-left">
										<span className="block text-2xl font-display font-bold tracking-widest text-[#d4af37]">AMADY</span>
										<span className="block text-[8px] font-sans font-bold tracking-[0.2em] text-[#fdfcf0]/60 uppercase">Pilgrimage Experiences</span>
									</div>
								</div>
							</SheetHeader>
							<nav className="flex flex-col gap-6 mt-12">
								{NAV_LINKS.map((link) => (
									<NavLink key={link.to} to={link.to} className={({ isActive }) => `text-lg font-sans font-medium transition-all ${isActive ? "text-[#d4af37] translate-x-2" : "text-[#fdfcf0]/70 hover:text-[#d4af37]"}`}>
										{link.label}
									</NavLink>
								))}
								{user?.role === "admin" && (
									<NavLink to="/admin" className="text-lg text-[#d4af37] font-bold border-t border-[#d4af37]/20 pt-6 flex items-center gap-2">
										<LayoutDashboard className="h-5 w-5" /> Admin Panel
									</NavLink>
								)}
							</nav>
						</SheetContent>
					</Sheet>
				</div>

				<Link to="/" className="flex items-center gap-4 group">
					<div className="h-16 w-16 overflow-hidden transition-transform duration-500 group-hover:scale-105">
						<img src={logo} alt="Amady Logo" className="h-full w-full object-contain" />
					</div>
					<div className="flex flex-col leading-none">
						<span className="text-3xl font-display font-bold tracking-[0.15em] text-[#d4af37]">AMADY</span>
						<span className="text-[9px] font-sans font-bold text-[#fdfcf0]/70 uppercase tracking-[0.3em] mt-1">Pilgrimage Experiences</span>
					</div>
				</Link>

				<nav className="ml-16 hidden lg:flex items-center gap-10">
					{NAV_LINKS.map((link) => (
						<NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm font-sans font-semibold tracking-[0.1em] uppercase transition-all hover:text-[#d4af37] relative py-1 ${isActive ? "text-[#d4af37] after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-[#d4af37]" : "text-[#fdfcf0]/80"}`}>
							{link.label}
						</NavLink>
					))}
					{user?.role === "admin" && (
						<NavLink to="/admin" className="text-[10px] text-[#0a0e1a] font-bold uppercase tracking-widest bg-[#d4af37] px-4 py-2 rounded-full hover:bg-[#b8860b] transition-colors flex items-center gap-2">
							<LayoutDashboard className="h-3.5 w-3.5" /> Dashboard
						</NavLink>
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
			<Button size="lg" className="rounded-full font-bold px-8 bg-[#d4af37] text-[#0a0e1a] hover:bg-[#b8860b] hover:scale-105 transition-all shadow-lg shadow-[#d4af37]/20" asChild>
				<Link to="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<div className="flex items-center gap-3 p-1 pr-3 rounded-full hover:bg-white/5 transition-colors border border-transparent hover:border-[#d4af37]/20">
					<Avatar className="h-10 w-10 border border-[#d4af37]/30 shadow-sm ring-1 ring-[#d4af37]/20">
						<AvatarImage src={user.avatar_url || "/brand/amady-logo.png"} />
						<AvatarFallback className="bg-[#d4af37] text-[#0a0e1a] font-bold">{user.first_name?.charAt(0) ?? "A"}</AvatarFallback>
					</Avatar>
					<div className="hidden sm:block text-left">
						<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] leading-none mb-1">Pilgrim</p>
						<p className="text-sm font-bold text-[#fdfcf0] leading-none">{user.first_name}</p>
					</div>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-64 rounded-2xl p-2 bg-[#0a0e1a] border border-[#d4af37]/20 shadow-2xl" align="end" sideOffset={8}>
				<DropdownMenuLabel className="px-4 py-4">
					<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-[0.2em] mb-1">Authenticated</p>
					<p className="text-sm font-bold text-[#fdfcf0] truncate">{user.email}</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-[#d4af37]/10 mx-2" />
				<DropdownMenuGroup className="p-1">
					<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 text-[#fdfcf0]/80 focus:bg-[#d4af37]/10 focus:text-[#d4af37]">
						<Link to="/account/details"><Info className="mr-3 h-4 w-4 opacity-50" /> Profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 text-[#fdfcf0]/80 focus:bg-[#d4af37]/10 focus:text-[#d4af37]">
						<Link to="/account/bookings"><Calendar className="mr-3 h-4 w-4 opacity-50" /> My Journeys</Link>
					</DropdownMenuItem>
					{user.role === "admin" && (
						<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 bg-[#d4af37]/5 text-[#d4af37] focus:bg-[#d4af37]/10">
							<Link to="/admin"><LayoutDashboard className="mr-3 h-4 w-4" /> Admin Panel</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="bg-[#d4af37]/10 mx-2" />
				<Form action="/logout" method="POST" className="p-1">
					<button type="submit" className="w-full">
						<DropdownMenuItem variant="destructive" className="rounded-xl cursor-pointer py-3 focus:bg-red-950/30 text-red-400">
							{isLoggingOut ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <LogOutIcon className="mr-3 h-4 w-4" />}
							Logout
						</DropdownMenuItem>
					</button>
				</Form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
