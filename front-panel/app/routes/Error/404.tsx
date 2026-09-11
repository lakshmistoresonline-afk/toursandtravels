export default function NotFound() {
	return (
		<div className="flex min-h-screen w-screen flex-col items-center justify-center bg-[#0a0e1a] p-6 text-center">
			<div className="space-y-8 animate-in zoom-in-95 duration-700">
				<h1 className="text-8xl md:text-[10rem] font-serif text-[#d4af37] opacity-20 leading-none">
					404
				</h1>
				<div className="space-y-4">
					<h2 className="text-4xl font-serif text-[#fdfcf0]">Path Not Found</h2>
					<div className="w-16 h-0.5 bg-[#d4af37]/40 mx-auto rounded-full" />
					<p className="text-[#fdfcf0]/40 max-w-md mx-auto text-[11px] font-bold uppercase tracking-[0.3em] leading-relaxed">
						The destination you seek is currently beyond our sacred map.
					</p>
				</div>
				<div className="pt-8">
					<a
						href="/"
						className="px-12 py-4 bg-[#d4af37] text-[#0a0e1a] rounded-full font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-yellow-900/20 hover:scale-105 transition-transform inline-block"
					>
						Return to Sanctuary
					</a>
				</div>
			</div>
		</div>
	);
}
