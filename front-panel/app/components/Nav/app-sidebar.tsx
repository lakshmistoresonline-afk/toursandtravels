import { ComponentProps } from "react";
import { Compass } from "lucide-react";
import { NavMain } from "~/components/Nav/nav-main";
import {
	Sidebar,
	SidebarContent,
	SidebarFooter,
	SidebarHeader,
	SidebarMenu,
	SidebarMenuItem,
} from "~/components/ui/sidebar";
import { Link } from "react-router";
import LogoutButton from "~/components/Auth/logout-button";

export function AppSidebar({ ...props }: ComponentProps<typeof Sidebar>) {
	return (
		<Sidebar collapsible="offcanvas" {...props}>
			<SidebarHeader className="mb-2">
				<SidebarMenu>
					<SidebarMenuItem className="px-3 pt-4">
						<Link to="/" viewTransition prefetch="viewport" className="flex items-center gap-3 group">
							<div className="h-10 w-10 rounded-full glass-card border border-[#d4af37]/30 flex items-center justify-center text-[#d4af37] shadow-[0_0_10px_rgba(212,175,55,0.2)] transition-transform duration-500 group-hover:rotate-12">
								<Compass className="h-5 w-5" />
							</div>
							<div className="flex flex-col leading-none">
								<span className="text-xl font-display font-bold tracking-widest text-[#d4af37]">AMBADY</span>
								<span className="text-[6px] font-sans font-bold text-[#fdfcf0]/60 uppercase tracking-[0.2em]">Pilgrimage Experiences</span>
							</div>
						</Link>
					</SidebarMenuItem>
				</SidebarMenu>
			</SidebarHeader>
			<SidebarContent>
				<NavMain />
			</SidebarContent>
			<SidebarFooter className="mt-6">
				<LogoutButton />
			</SidebarFooter>
		</Sidebar>
	);
}
