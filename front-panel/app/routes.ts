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
			]),
			...prefix("registrations", [index("./routes/admin/Booking/bookings.tsx")]),
			route("users", "./routes/admin/users.tsx"),
		]),
	]),

	route("*", "./routes/Error/404.tsx"),
] satisfies RouteConfig;
