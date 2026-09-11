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
				"sticky top-0 z-50 transition-all duration-500",
				isHomePage
					? "bg-transparent border-b border-white/10"
					: "bg-background/95 backdrop-blur-md border-b border-primary/20 shadow-lg",
			)}
		>
			<div className="container mx-auto flex items-center h-20 px-6">
				{/* Mobile menu */}
				<div className="mr-4 lg:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button
								variant="ghost"
								size="icon"
								className="rounded-full text-primary hover:bg-primary/5"
							>
								<Menu className="h-5 w-5" />
							</Button>
						</SheetTrigger>
						<SheetContent
							side="left"
							className="w-[300px] bg-background border-r border-primary/20 p-8 shadow-2xl"
						>
							<div className="mb-12">
								<Link to="/" className="flex items-center gap-3">
									<Compass className="h-8 w-8 text-primary" />
									<span className="text-2xl font-display font-bold tracking-widest text-primary">
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
											`text-[10px] font-bold uppercase tracking-[0.3em] transition-all ${isActive ? "text-primary pl-4 border-l-2 border-primary" : "text-foreground/60 hover:text-primary"}`
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
					<div className="h-10 w-10 rounded-full bg-primary/5 border border-primary/40 flex items-center justify-center text-primary shadow-[0_0_15px_rgba(212,175,55,0.1)] transition-transform duration-500 group-hover:rotate-12">
						<Compass className="h-6 w-6" />
					</div>
					<div className="flex flex-col leading-none">
						<span className="text-2xl font-display font-bold tracking-[0.2em] text-primary">
							AMBADY
						</span>
						<span className="text-[7px] font-bold text-primary/60 uppercase tracking-[0.3em] mt-1">
							Pilgrimage Experiences
						</span>
					</div>
				</Link>

				<nav className="ml-12 hidden lg:flex items-center gap-8">
					{NAV_LINKS.map((link) => (
						<NavLink
							key={link.to}
							to={link.to}
							prefetch="intent"
							className={({ isActive }) =>
								`text-[10px] font-bold uppercase tracking-[0.2em] transition-all hover:text-primary ${isActive ? "text-primary" : "text-foreground/60"}`
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
				className="rounded-full font-bold px-6 bg-primary text-primary-foreground hover:bg-primary/90 text-[9px] uppercase tracking-widest shadow-lg shadow-primary/10"
				asChild
			>
				<Link to="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<div className="flex items-center gap-2 p-1 rounded-full hover:bg-primary/5 transition-colors">
					<Avatar className="h-8 w-8 border border-primary/30">
						<AvatarImage src={user.avatar_url || undefined} />
						<AvatarFallback className="bg-primary text-primary-foreground font-bold text-xs">
							{user.first_name?.charAt(0) ?? "A"}
						</AvatarFallback>
					</Avatar>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent
				className="w-56 rounded-2xl p-2 bg-background border border-primary/20 shadow-2xl"
				align="end"
				sideOffset={8}
			>
				<DropdownMenuLabel className="px-4 py-3">
					<p className="text-[10px] font-bold text-foreground truncate tracking-wide">
						{user.email}
					</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-primary/10" />
				<DropdownMenuGroup>
					<DropdownMenuItem
						asChild
						className="rounded-xl cursor-pointer py-2.5 text-[10px] uppercase tracking-widest text-foreground/70 focus:bg-primary/10"
					>
						<Link to="/account/details">Profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem
						asChild
						className="rounded-xl cursor-pointer py-2.5 text-[10px] uppercase tracking-widest text-foreground/70 focus:bg-primary/10"
					>
						<Link to="/account/bookings">My Journeys</Link>
					</DropdownMenuItem>
					{user.role === "admin" && (
						<DropdownMenuItem
							asChild
							className="rounded-xl cursor-pointer py-2.5 text-[10px] uppercase tracking-widest bg-primary/5 text-primary focus:bg-primary/10"
						>
							<Link to="/admin">Admin Dashboard</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="bg-primary/10" />
				<Form action="/logout" method="POST" className="p-1">
					<button type="submit" className="w-full">
						<DropdownMenuItem
							variant="destructive"
							className="rounded-xl cursor-pointer py-2.5 text-[10px] uppercase tracking-widest text-red-500"
						>
							{isLoggingOut ? <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : null}
							Logout
						</DropdownMenuItem>
					</button>
				</Form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
