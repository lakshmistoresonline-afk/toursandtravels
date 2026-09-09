import { Link } from "react-router";
import { Heart } from "lucide-react";

export default function Footer() {
	return (
		<footer className="border-t bg-background mt-20">
			<div className="container mx-auto py-12 px-4">
				<div className="grid gap-8 md:grid-cols-3">
					<div className="space-y-4">
						<span className="text-xl font-bold">WanderNest</span>
						<p className="text-sm text-muted-foreground">
							Simple Tour Management System. Easy bookings for memorable trips.
						</p>
					</div>

					<div>
						<h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Quick Links</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
							<li><Link to="/tours" className="hover:text-primary transition-colors">Our Tours</Link></li>
							<li><Link to="/faqs" className="hover:text-primary transition-colors">FAQs</Link></li>
						</ul>
					</div>

					<div>
						<h4 className="mb-4 text-sm font-semibold uppercase tracking-wider">Support</h4>
						<ul className="space-y-2 text-sm text-muted-foreground">
							<li><Link to="/contact-us" className="hover:text-primary transition-colors">Contact</Link></li>
							<li><Link to="/privacy-policy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
						</ul>
					</div>
				</div>

				<div className="mt-12 flex flex-col gap-4 border-t pt-8 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
					<p>© {new Date().getFullYear()} WanderNest. All rights reserved.</p>
					<span className="flex gap-2 items-center">
						<span>Built for travelers</span>
						<Heart className="size-4 text-destructive fill-destructive" />
					</span>
				</div>
			</div>
		</footer>
	);
}
