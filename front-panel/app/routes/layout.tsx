import { Outlet } from "react-router";
import Header from "~/components/Header/Header";
import Footer from "~/components/Footer/Footer";

export default function AppLayout() {
	return (
		<div className="flex flex-col min-h-screen relative bg-background w-full">
			<Header />
			<main className="flex-1 w-full">
				<Outlet />
			</main>
			<Footer />
		</div>
	);
}
