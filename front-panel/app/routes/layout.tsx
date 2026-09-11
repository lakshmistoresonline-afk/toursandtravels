import { Outlet, useLocation } from "react-router";
import Header from "~/components/Header/Header";
import Footer from "~/components/Footer/Footer";

export default function AppLayout() {
	const location = useLocation();
	const isHomePage = location.pathname === "/";

	return (
		<div
			className={`flex flex-col min-h-screen relative ${isHomePage ? "ambady-home-bg theme-home" : "bg-background"}`}
		>
			<Header />
			<main className="flex-1">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
