import { Outlet } from "react-router";
import Header from "~/components/Header/Header";
import Footer from "~/components/Footer/Footer";

export default function AppLayout() {
	return (
		<div className="flex flex-col min-h-screen bg-transparent relative">
			<Header />
			<main className="flex-1 bg-black/40 backdrop-blur-sm">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
