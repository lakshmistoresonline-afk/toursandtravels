import { Form, Link, NavLink, useNavigation, useRouteLoaderData, useLocation } from "react-router";
import { Menu, Loader2, Compass } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "~/components/ui/sheet";
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
import { cn } from "@workspace/shared/utils/ui";

const NAV_LINKS = [
	{ label: "Home", to: "/" },
	{ label: "Journeys", to: "/tours" },
	{ label: "About", to: "/about" },
	{ label: "Contact", to: "/contact-us" },
];

export default function Header() {
	const rootLoaderData = useRouteLoaderData<typeof loader>("root");
	const user = rootLoaderData?.user as FullCurrentUser | null;
	const location = useLocation();
	const isHomePage = location.pathname === "/";

	return (
		<header
			className={cn(
				"sticky top-0 z-50 transition-all duration-500 w-full",
				isHomePage
					? "bg-[#0a0e1a]/80 backdrop-blur-lg border-b border-white/5"
					: "bg-[#0a0e1a] border-b border-[#d4af37]/20 shadow-2xl",
			)}
		>
			<div className="container mx-auto flex items-center h-20 md:h-24 px-6">
				{/* Mobile menu */}
				<div className="mr-4 lg:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full text-[#d4af37] hover:bg-white/5"
							>
								<Menu className="h-6 w-6" />
							</Button>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="w-[300px] bg-[#0a0e1a] border-r border-[#d4af37]/20 p-8 shadow-2xl"
						>
							<div className="mb-12">
								<Link to="/" className="flex items-center gap-3">
									<Compass className="h-8 w-8 text-[#d4af37]" />
									<span className="text-2xl font-display font-bold tracking-widest text-[#d4af37]">
										AMBADY
									</span>
								</Link>
							</div>
							<nav className="flex flex-col gap-8">
								{NAV_LINKS.map((link) => (
									<NavLink
										key={link.to}
										to={link.to}
										prefetch="intent"
										className={({ isActive }) =>
											`text-[11px] font-bold uppercase tracking-[0.3em] transition-all ${isActive ? "text-[#d4af37] pl-4 border-l-2 border-[#d4af37]" : "text-[#fdfcf0]/60 hover:text-[#d4af37]"}`
										}
									>
										{link.label}
									</NavLink>
								))}
							</nav>
						</SheetContent>
					</Sheet>
				</div>

				<Link to="/" className="flex items-center gap-4 group">
					<div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-white/5 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-[0_0_20px_rgba(212,175,55,0.1)] transition-transform duration-500 group-hover:rotate-12">
						<Compass className="h-6 w-6 md:h-7 md:w-7" />
					</div>
					<div className="flex flex-col leading-none">
						<span className="text-2xl md:text-3xl font-display font-bold tracking-[0.15em] text-[#d4af37]">
							AMBADY
						</span>
						<span className="text-[7px] md:text-[8px] font-bold text-[#d4af37]/60 uppercase tracking-[0.35em] mt-1">
							Pilgrimage Experiences
						</span>
					</div>
				</Link>

				<nav className="ml-12 hidden lg:flex items-center gap-12">
					{NAV_LINKS.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							prefetch="intent"
							className={({ isActive }) =>
								`text-[11px] font-bold uppercase tracking-[0.25em] transition-all hover:text-[#d4af37] ${isActive ? "text-[#d4af37]" : "text-[#fdfcf0]/70"}`
							}
						>
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
			<Button
				size="sm"
				className="rounded-full font-bold px-8 bg-[#d4af37] text-[#0a0e1a] hover:bg-[#d4af37]/90 text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-yellow-900/20 h-12"
				asChild
			>
				<Link to="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<div className="flex items-center gap-2 p-1 rounded-full hover:bg-white/5 transition-colors border border-white/10 pr-4">
					<Avatar className="h-9 w-9 border border-[#d4af37]/30">
						<AvatarImage src={user.avatar_url || undefined} />
						<AvatarFallback className="bg-[#d4af37] text-[#0a0e1a] font-bold text-xs">
							{user.first_name?.charAt(0) ?? "A"}
						</AvatarFallback>
					</Avatar>
					<span className="text-[9px] font-bold uppercase tracking-widest text-[#fdfcf0]/60 hidden sm:inline">
						Menu
					</span>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-56 rounded-2xl p-2 bg-[#0a0e1a] border border-[#d4af37]/20 shadow-2xl"
				align="end"
				sideOffset={12}
			>
				<DropdownMenuLabel className="px-4 py-4">
					<p className="text-[10px] font-bold text-[#fdfcf0]/40 uppercase tracking-widest mb-1">
						Logged in as
					</p>
					<p className="text-xs font-bold text-[#fdfcf0] truncate tracking-wide">
						{user.email}
					</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-white/5" />
				<DropdownMenuGroup>
					<DropdownMenuItem
						asChild
						className="rounded-xl cursor-pointer py-3 text-[10px] uppercase tracking-[0.2em] text-[#fdfcf0]/70 focus:bg-white/5 focus:text-[#d4af37]"
					>
						<Link to="/account/details">Profile Settings</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						asChild
						className="rounded-xl cursor-pointer py-3 text-[10px] uppercase tracking-[0.2em] text-[#fdfcf0]/70 focus:bg-white/5 focus:text-[#d4af37]"
					>
						<Link to="/account/bookings">My Sacred Journeys</Link>
					</DropdownMenuItem>
					{user.role === "admin" && (
						<DropdownMenuItem
							asChild
							className="rounded-xl cursor-pointer py-3 text-[10px] uppercase tracking-[0.2em] bg-[#d4af37]/5 text-[#d4af37] focus:bg-[#d4af37]/10"
						>
							<Link to="/admin">Admin Sanctuary</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="bg-white/5" />
				<Form action="/logout" method="POST" className="p-1">
					<button type="submit" className="w-full">
						<DropdownMenuItem
							variant="destructive"
							className="rounded-xl cursor-pointer py-3 text-[10px] uppercase tracking-[0.2em] text-red-400 focus:bg-red-500/10"
						>
							{isLoggingOut ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
							Sign Out
						</DropdownMenuItem>
					</button>
				</Form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
