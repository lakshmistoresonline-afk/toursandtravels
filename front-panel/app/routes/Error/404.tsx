export default function NotFound() {
	return (
		<div className="flex h-screen w-screen flex-col items-center justify-center bg-background p-6 text-center">
			<h1 className="text-4xl font-serif text-foreground mb-4">404 — Path Not Found</h1>
			<p className="text-foreground/60 mb-8 max-w-md">
				The destination you seek is currently beyond our map.
			</p>
			<a
				href="/"
				className="px-8 py-3 bg-primary text-primary-foreground rounded-full font-bold uppercase tracking-widest text-[10px]"
			>
				Return to Sanctuary
			</a>
		</div>
	);
}
