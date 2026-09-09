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
	{ label: "Tours", to: "/tours" },
	{ label: "About", to: "/about" },
	{ label: "FAQs", to: "/faqs" },
];

export default function Header() {
	const rootLoaderData = useRouteLoaderData<typeof loader>("root");
	const user = rootLoaderData?.user as FullCurrentUser | null;

	return (
		<header className="bg-white/80 backdrop-blur-xl border-b sticky top-0 z-50">
			<div className="container mx-auto flex items-center h-20 px-4">
				{/* Mobile menu */}
				<div className="mr-4 lg:hidden">
					<Sheet>
						<SheetTrigger asChild>
							<Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50"><Menu className="h-6 w-6" /></Button>
						</SheetTrigger>
						<SheetContent side="left" className="w-[300px] rounded-r-3xl">
							<SheetHeader className="mt-8">
								<div className="flex items-center gap-2 text-primary">
									<img src="/ambady-logo.png" alt="Ambady" className="h-10 w-10 object-contain rounded-full shadow-sm" />
									<span className="text-xl font-black tracking-tight">Ambady</span>
								</div>
							</SheetHeader>
							<nav className="flex flex-col gap-6 mt-12">
								{NAV_LINKS.map((link) => (
									<NavLink key={link.to} to={link.to} className={({ isActive }) => `text-lg font-bold transition-all ${isActive ? "text-primary translate-x-2" : "text-slate-500"}`}>
										{link.label}
									</NavLink>
								))}
								{user?.role === "admin" && (
									<NavLink to="/admin" className="text-lg text-emerald-600 font-black border-t pt-6 flex items-center gap-2">
										<LayoutDashboard className="h-5 w-5" /> Admin Panel
									</NavLink>
								)}
							</nav>
						</SheetContent>
					</Sheet>
				</div>

				<Link to="/" className="flex items-center gap-3 group">
					<div className="h-12 w-12 rounded-full overflow-hidden border-2 border-primary/20 shadow-md group-hover:scale-105 transition-transform duration-300">
						<img src="/ambady-logo.png" alt="Ambady Tours Logo" className="h-full w-full object-cover" />
					</div>
					<div className="flex flex-col leading-none">
						<span className="text-2xl font-black tracking-tighter text-slate-900 uppercase">Ambady</span>
						<span className="text-[10px] font-bold text-primary uppercase tracking-[0.2em]">Tours & Travels</span>
					</div>
				</Link>

				<nav className="ml-16 hidden lg:flex items-center gap-10">
					{NAV_LINKS.map((link) => (
						<NavLink key={link.to} to={link.to} className={({ isActive }) => `text-sm font-bold tracking-wide transition-all hover:text-primary relative py-1 ${isActive ? "text-primary after:absolute after:bottom-0 after:left-0 after:w-full after:h-0.5 after:bg-primary" : "text-slate-500"}`}>
							{link.label}
						</NavLink>
					))}
					{user?.role === "admin" && (
						<NavLink to="/admin" className="text-sm text-emerald-600 font-black hover:opacity-80 flex items-center gap-1.5 bg-emerald-50 px-4 py-2 rounded-full">
							<LayoutDashboard className="h-4 w-4" /> Dashboard
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
			<Button size="lg" className="rounded-2xl font-bold px-8 shadow-lg shadow-primary/20 hover:scale-105 transition-transform" asChild>
				<Link to="/login">Sign In</Link>
			</Button>
		);
	}

	return (
		<DropdownMenu>
			<DropdownMenuTrigger asChild className="cursor-pointer">
				<div className="flex items-center gap-3 p-1 pr-3 rounded-2xl hover:bg-slate-50 transition-colors border-2 border-transparent hover:border-slate-100">
					<Avatar className="h-10 w-10 border-2 border-white shadow-sm ring-2 ring-primary/10">
						<AvatarImage src={user.avatar_url || "/ambady-logo.png"} />
						<AvatarFallback className="bg-primary text-white font-bold">{user.first_name?.charAt(0) ?? "A"}</AvatarFallback>
					</Avatar>
					<div className="hidden sm:block text-left">
						<p className="text-xs font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Welcome,</p>
						<p className="text-sm font-bold text-slate-900 leading-none">{user.first_name}</p>
					</div>
				</div>
			</DropdownMenuTrigger>
			<DropdownMenuContent className="w-64 rounded-3xl p-2 shadow-2xl border-slate-100" align="end" sideOffset={8}>
				<DropdownMenuLabel className="px-4 py-4">
					<p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Authenticated Account</p>
					<p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
				</DropdownMenuLabel>
				<DropdownMenuSeparator className="bg-slate-50 mx-2" />
				<DropdownMenuGroup className="p-1">
					<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
						<Link to="/account/details"><Info className="mr-3 h-4 w-4 text-slate-400" /> Account Profile</Link>
					</DropdownMenuItem>
					<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3">
						<Link to="/account/bookings"><Calendar className="mr-3 h-4 w-4 text-slate-400" /> My Registrations</Link>
					</DropdownMenuItem>
					{user.role === "admin" && (
						<DropdownMenuItem asChild className="rounded-xl cursor-pointer py-3 bg-emerald-50/50 text-emerald-700 focus:bg-emerald-50 focus:text-emerald-700">
							<Link to="/admin"><LayoutDashboard className="mr-3 h-4 w-4" /> Admin Dashboard</Link>
						</DropdownMenuItem>
					)}
				</DropdownMenuGroup>
				<DropdownMenuSeparator className="bg-slate-50 mx-2" />
				<Form action="/logout" method="POST" className="p-1">
					<button type="submit" className="w-full">
						<DropdownMenuItem variant="destructive" className="rounded-xl cursor-pointer py-3 focus:bg-red-50 focus:text-red-600">
							{isLoggingOut ? <Loader2 className="mr-3 h-4 w-4 animate-spin" /> : <LogOutIcon className="mr-3 h-4 w-4" />}
							Logout
						</DropdownMenuItem>
					</button>
				</Form>
			</DropdownMenuContent>
		</DropdownMenu>
	);
}
