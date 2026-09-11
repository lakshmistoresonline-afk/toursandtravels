import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createBrowserRouter, RouterProvider } from "react-router";
import "./app.css";

// Import App Root
import App, { HydrateFallback, clientLoader as rootLoader } from "./root";

// Import Layouts
import PublicLayout from "./routes/layout";
import AccountLayout from "./routes/Account/account-layout";
import AdminLayout, { clientLoader as adminLoader } from "./routes/admin/layout";

// Import Route Components & Data Loaders
import Home, { clientLoader as homeLoader } from "./routes/Home/home";
import Login, { clientAction as loginAction } from "./routes/Auth/login";
import Signup, { clientAction as signupAction } from "./routes/Auth/signup";
import TourDetails, { clientLoader as tourDetailsLoader, clientAction as tourDetailsAction } from "./routes/Tour/tour-details";
import AccountDetails, { clientAction as accountDetailsAction } from "./routes/Account/account-details";
import MyBookings, { clientLoader as myBookingsLoader } from "./routes/Account/my-bookings";
import About from "./routes/About/about";
import Contact, { clientAction as contactAction } from "./routes/Contact/contact-us";
import PrivacyPolicy from "./routes/Miscellaneous/PrivacyPolicy";
import TermsOfUsage from "./routes/Miscellaneous/TermsOfUsage";
import AdminDashboard, { clientLoader as adminDashboardLoader } from "./routes/admin/dashboard";
import AdminTours, { clientLoader as adminToursLoader } from "./routes/admin/Tours/tours";
import AddTour, { clientAction as addTourAction } from "./routes/admin/Tours/add-tour";
import UpdateTour, { clientLoader as updateTourLoader, clientAction as updateTourAction } from "./routes/admin/Tours/update-tour";
import AdminBookings, { clientLoader as adminBookingsLoader, clientAction as adminBookingsAction } from "./routes/admin/Booking/bookings";
import NotFound from "./routes/Error/404";
import LogoutRoute, { clientAction as logoutAction } from "./routes/_actions/logout";

const router = createBrowserRouter([
	{
		id: "root",
		path: "/",
		element: <App />,
		loader: rootLoader as any,
		hydrateFallbackElement: <HydrateFallback />,
		children: [
			{
				path: "logout",
				action: logoutAction as any,
			},
			{
				element: <PublicLayout />,
				children: [
					{
						index: true,
						element: <Home />,
						loader: homeLoader as any,
					},
					{
						path: "login",
						element: <Login />,
						action: loginAction as any,
					},
					{
						path: "signup",
						element: <Signup />,
						action: signupAction as any,
					},
					{
						path: "tours",
						children: [
							{
								path: "tour/:id",
								element: <TourDetails />,
								loader: tourDetailsLoader as any,
								action: tourDetailsAction as any,
							},
						],
					},
					{
						path: "account",
						element: <AccountLayout />,
						children: [
							{
								path: "details",
								element: <AccountDetails />,
								action: accountDetailsAction as any,
							},
							{
								path: "bookings",
								element: <MyBookings />,
								loader: myBookingsLoader as any,
							},
						],
					},
					{ path: "about", element: <About /> },
					{ path: "contact-us", element: <Contact />, action: contactAction as any },
					{ path: "privacy-policy", element: <PrivacyPolicy /> },
					{ path: "terms-of-usage", element: <TermsOfUsage /> },
				],
			},
			{
				path: "admin",
				element: <AdminLayout />,
				loader: adminLoader as any,
				children: [
					{
						index: true,
						element: <AdminDashboard />,
						loader: adminDashboardLoader as any,
					},
					{
						path: "tours",
						children: [
							{
								index: true,
								element: <AdminTours />,
								loader: adminToursLoader as any,
							},
							{
								path: "add",
								element: <AddTour />,
								action: addTourAction as any,
							},
							{
								path: "edit/:id",
								element: <UpdateTour />,
								loader: updateTourLoader as any,
								action: updateTourAction as any,
							},
						],
					},
					{
						path: "registrations",
						element: <AdminBookings />,
						loader: adminBookingsLoader as any,
						action: adminBookingsAction as any,
					},
				],
			},
			{
				path: "*",
				element: <NotFound />,
			},
		],
	},
]);

createRoot(document.getElementById("root")!).render(
	<StrictMode>
		<RouterProvider router={router} />
	</StrictMode>,
);
