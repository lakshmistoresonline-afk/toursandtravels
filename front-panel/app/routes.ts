import { type RouteConfig, index, layout, prefix, route } from "@react-router/dev/routes";

export default [
	route("/logout", "./routes/_actions/logout.tsx"),

	layout("./routes/layout.tsx", [
		index("routes/Home/home.tsx"),
		route("/login", "./routes/Auth/login.tsx"),
		route("/signup", "./routes/Auth/signup.tsx"),

		...prefix("tours", [
			index("./routes/Tour/tours.tsx"),
			route("tour/:id", "./routes/Tour/tour-details.tsx"),
			route("print/:id", "./routes/Tour/itinerary-print.tsx"),
		]),

		layout("./routes/Account/account-layout.tsx", [
			...prefix("account", [
				route("details", "./routes/Account/account-details.tsx"),
				route("bookings", "./routes/Account/my-bookings.tsx"),
			]),
		]),

		route("about", "./routes/About/about.tsx"),
		route("contact-us", "./routes/Contact/contact-us.tsx"),
		route("privacy-policy", "./routes/Miscellaneous/PrivacyPolicy.tsx"),
		route("terms-of-usage", "./routes/Miscellaneous/TermsOfUsage.tsx"),
	]),

	// Admin routes
	layout("./routes/admin/layout.tsx", [
		...prefix("admin", [
			index("./routes/admin/dashboard.tsx"),
			...prefix("tours", [
				index("./routes/admin/Tours/tours.tsx"),
				route("add", "./routes/admin/Tours/add-tour.tsx"),
				route("edit/:id", "./routes/admin/Tours/update-tour.tsx"),
				route("announcement/:id", "./routes/admin/Tours/announcement.tsx"),
				route("manifesto/:id", "./routes/admin/Tours/manifesto.tsx"),
			]),
			route("destinations", "./routes/admin/Destinations/destinations.tsx"),
			route("destinations/add", "./routes/admin/Destinations/add-spot.tsx"),
			route("destinations/edit/:id", "./routes/admin/Destinations/edit-spot.tsx"),
			route("circuits", "./routes/admin/Circuits/circuits.tsx"),
			route("circuits/add", "./routes/admin/Circuits/add-circuit.tsx"),
			route("circuits/edit/:id", "./routes/admin/Circuits/edit-circuit.tsx"),
			...prefix("registrations", [index("./routes/admin/Booking/bookings.tsx")]),
			route("users", "./routes/admin/users.tsx"),
			route("stats", "./routes/admin/analytics.tsx"),
		]),
	]),

	route("*", "./routes/Error/404.tsx"),
] satisfies RouteConfig;
