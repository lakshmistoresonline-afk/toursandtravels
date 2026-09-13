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
									<nav className="flex flex-col gap-10">
								{NAV_LINKS.map((link) => (
									<NavLink
										key={link.to}
										to={link.to}
										prefetch="intent"
										className={({ isActive }) =>
											`text-sm font-bold uppercase tracking-[0.3em] transition-all ${isActive ? "text-[#d4af37] pl-4 border-l-2 border-[#d4af37]" : "text-[#fdfcf0]/60 hover:text-[#d4af37]"}`
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
					<div className="h-12 w-12 md:h-16 md:w-16 rounded-full bg-white/5 border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-[0_0_25px_rgba(212,175,55,0.15)] transition-transform duration-500 group-hover:rotate-12">
						<Compass className="h-7 w-7 md:h-9 md:w-9" />
					</div>
					<div className="flex flex-col leading-none">
						<span className="text-3xl md:text-4xl font-display font-bold tracking-[0.15em] text-[#d4af37]">
							AMBADY
						</span>
						<span className="text-[8px] md:text-[10px] font-bold text-[#d4af37]/80 uppercase tracking-[0.4em] mt-1.5">
							Pilgrimage Experiences
						</span>
					</div>
				</Link>

				<nav className="ml-16 hidden lg:flex items-center gap-16">
					{NAV_LINKS.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							prefetch="intent"
							className={({ isActive }) =>
								`text-xs font-bold uppercase tracking-[0.3em] transition-all hover:text-[#d4af37] ${isActive ? "text-[#d4af37]" : "text-[#fdfcf0]/80"}`
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
				size="lg"
				className="rounded-full font-bold px-10 bg-[#d4af37] text-[#0a0e1a] hover:bg-[#d4af37]/90 text-xs uppercase tracking-[0.2em] shadow-2xl shadow-yellow-900/30 h-16"
				asChild
			>
				<Link to="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<div className="flex items-center gap-3 p-1.5 rounded-full hover:bg-white/5 transition-colors border-2 border-white/10 pr-6">
					<Avatar className="h-10 w-10 md:h-12 md:w-12 border-2 border-[#d4af37]/40">
						<AvatarImage src={user.avatar_url || undefined} />
						<AvatarFallback className="bg-[#d4af37] text-[#0a0e1a] font-bold text-sm">
							{user.first_name?.charAt(0) ?? "A"}
						</AvatarFallback>
					</Avatar>
					<span className="text-[10px] font-bold uppercase tracking-widest text-[#fdfcf0]/80 hidden sm:inline">
						Menu
					</span>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-72 rounded-[1.5rem] p-3 bg-[#0a0e1a] border-2 border-[#d4af37]/30 shadow-2xl"
				align="end"
				sideOffset={16}
			>
				<DropdownMenuLabel className="px-5 py-6">
					<p className="text-[10px] font-bold text-[#fdfcf0]/50 uppercase tracking-widest mb-2">
						Pilgrim Account
					</p>
					<p className="text-sm font-bold text-[#fdfcf0] truncate tracking-wide">
						{user.email}
					</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-white/10" />
				<DropdownMenuGroup className="space-y-1 py-2">
					<DropdownMenuItem
						asChild
						className="rounded-xl cursor-pointer py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#fdfcf0]/80 focus:bg-white/5 focus:text-[#d4af37]"
					>
						<Link to="/account/details">Profile Settings</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						asChild
						className="rounded-xl cursor-pointer py-4 text-xs font-bold uppercase tracking-[0.2em] text-[#fdfcf0]/80 focus:bg-white/5 focus:text-[#d4af37]"
					>
						<Link to="/account/bookings">My Sacred Journeys</Link>
					</DropdownMenuItem>
					{user.role === "admin" && (
						<DropdownMenuItem
							asChild
							className="rounded-xl cursor-pointer py-4 text-xs font-bold uppercase tracking-[0.2em] bg-[#d4af37]/10 text-[#d4af37] focus:bg-[#d4af37]/20"
						>
							<Link to="/admin">Admin Sanctuary</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="bg-white/10" />
				<Form action="/logout" method="POST" className="p-1">
					<button type="submit" className="w-full">
						<DropdownMenuItem
							variant="destructive"
							className="rounded-xl cursor-pointer py-4 text-xs font-bold uppercase tracking-[0.2em] text-red-400 focus:bg-red-500/10"
						>
							{isLoggingOut ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : null}
							Sign Out
						</DropdownMenuItem>
					</button>
				</Form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
