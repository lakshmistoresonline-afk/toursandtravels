import { Outlet } from "react-router";
import Header from "~/components/Header/Header";
import Footer from "~/components/Footer/Footer";

export default function AppLayout() {
	return (
		<div className="flex flex-col min-h-screen bg-transparent">
			<Header />
			<main className="flex-1 bg-transparent">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
