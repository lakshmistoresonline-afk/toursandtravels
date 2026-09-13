import { useLoaderData } from "react-router";
import { BookingService } from "@workspace/shared/services/booking.service";
import { ToursService } from "@workspace/shared/services/tours.service";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
	BarChart,
	Bar,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer,
	PieChart,
	Pie,
	Cell,
} from "recharts";
import { IndianRupee, Users, TrendingUp, Wallet } from "lucide-react";

export const clientLoader = async () => {
	const bookingSvc = new BookingService();
	const toursSvc = new ToursService();

	const [registrationsResp, toursResp] = await Promise.all([
		bookingSvc.getAllRegistrations(0, 1000), // Fetch more for analytics
		toursSvc.getHighLevelTours(),
	]);

	const registrations = registrationsResp.registrations;
	const tours = toursResp.tours;

	// Calculate totals
	const totalRevenue = registrations
		.filter((r) => r.paymentStatus === "PAID")
		.reduce((acc, r) => acc + (r.tours?.price || 0) * r.travellersCount, 0);

	const pendingRevenue = registrations
		.filter((r) => r.paymentStatus !== "PAID" && r.status !== "CANCELLED")
		.reduce((acc, r) => acc + (r.tours?.price || 0) * r.travellersCount, 0);

	const totalPilgrims = registrations
		.filter((r) => r.status !== "CANCELLED")
		.reduce((acc, r) => acc + r.travellersCount, 0);

	// Revenue by Tour
	const revenueByTour = tours.map((t) => {
		const tourRegs = registrations.filter((r) => r.tourId === t.id && r.status !== "CANCELLED");
		const revenue = tourRegs
			.filter((r) => r.paymentStatus === "PAID")
			.reduce((acc, r) => acc + (t.price || 0) * r.travellersCount, 0);
		return {
			name: t.name.length > 15 ? t.name.substring(0, 15) + "..." : t.name,
			revenue,
		};
	}).filter(t => t.revenue > 0);

	// Registration Status Data
	const statusData = [
		{ name: "Paid", value: registrations.filter((r) => r.paymentStatus === "PAID").length },
		{ name: "Pending", value: registrations.filter((r) => r.paymentStatus !== "PAID" && r.status !== "CANCELLED").length },
	];

	return {
		stats: {
			totalRevenue,
			pendingRevenue,
			totalPilgrims,
			totalRegistrations: registrations.length,
		},
		revenueByTour,
		statusData,
	};
};

const COLORS = ["#d4af37", "#0a0e1a20"];

export default function AnalyticsPage() {
	const { stats, revenueByTour, statusData } = useLoaderData<typeof clientLoader>();

	return (
		<div className="flex flex-col gap-10 animate-in fade-in duration-700 max-w-7xl mx-auto pb-20">
			<MetaDetails
				metaTitle="Financial Analytics | AMBADY Admin"
				metaDescription="Analyze journey performance and financial growth."
			/>

			<div className="border-b border-primary/10 pb-8">
				<h1 className="text-4xl md:text-5xl font-serif text-foreground tracking-tight leading-tight">
					Financial Analytics
				</h1>
				<p className="text-foreground/40 mt-3 text-[10px] font-bold uppercase tracking-wider ml-1">
					Strategic overview of sacred journey performance.
				</p>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				<StatCard
					title="Total Revenue"
					value={`₹${stats.totalRevenue.toLocaleString()}`}
					icon={<IndianRupee className="h-5 w-5" />}
					description="Confirmed payments received"
					trend="Success"
				/>
				<StatCard
					title="Pending Exchange"
					value={`₹${stats.pendingRevenue.toLocaleString()}`}
					icon={<Wallet className="h-5 w-5" />}
					description="Awaiting pilgrim confirmation"
					trend="Awaiting"
					variant="secondary"
				/>
				<StatCard
					title="Total Pilgrims"
					value={stats.totalPilgrims.toString()}
					icon={<Users className="h-5 w-5" />}
					description="Active journey participants"
					trend="Growing"
				/>
				<StatCard
					title="Success Rate"
					value={`${Math.round((stats.totalRevenue / (stats.totalRevenue + stats.pendingRevenue || 1)) * 100)}%`}
					icon={<TrendingUp className="h-5 w-5" />}
					description="Ratio of paid vs pending"
					trend="Health"
				/>
			</div>

			<div className="grid lg:grid-cols-[1fr_400px] gap-8">
				{/* Bar Chart */}
				<Card className="rounded-[2.5rem] border-primary/10 shadow-xl overflow-hidden">
					<CardHeader className="p-8 bg-primary/5 border-b border-primary/5">
						<CardTitle className="text-xl font-serif">Revenue by Journey</CardTitle>
					</CardHeader>
					<CardContent className="p-8 h-[450px]">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart data={revenueByTour}>
								<CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#00000008" />
								<XAxis
									dataKey="name"
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 10, fontWeight: 700 }}
								/>
								<YAxis
									axisLine={false}
									tickLine={false}
									tick={{ fontSize: 10, fontWeight: 700 }}
									tickFormatter={(val) => `₹${(val / 1000).toFixed(0)}k`}
								/>
								<Tooltip
									cursor={{ fill: "#d4af3708" }}
									contentStyle={{
										borderRadius: "1rem",
										border: "1px solid rgba(212, 175, 55, 0.1)",
										boxShadow: "0 20px 40px rgba(0,0,0,0.1)",
									}}
								/>
								<Bar
									dataKey="revenue"
									fill="#d4af37"
									radius={[8, 8, 0, 0]}
									barSize={40}
								/>
							</BarChart>
						</ResponsiveContainer>
					</CardContent>
				</Card>

				{/* Pie Chart */}
				<Card className="rounded-[2.5rem] border-primary/10 shadow-xl overflow-hidden">
					<CardHeader className="p-8 bg-primary/5 border-b border-primary/5">
						<CardTitle className="text-xl font-serif">Payment Status</CardTitle>
					</CardHeader>
					<CardContent className="p-8 h-[450px] flex flex-col items-center justify-center">
						<ResponsiveContainer width="100%" height={300}>
							<PieChart>
								<Pie
									data={statusData}
									innerRadius={80}
									outerRadius={100}
									paddingAngle={5}
									dataKey="value"
								>
									{statusData.map((entry, index) => (
										<Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
									))}
								</Pie>
								<Tooltip />
							</PieChart>
						</ResponsiveContainer>
						<div className="grid grid-cols-2 gap-8 mt-8 w-full">
							{statusData.map((item, i) => (
								<div key={item.name} className="text-center">
									<p className="text-[9px] font-bold uppercase tracking-widest text-foreground/40 mb-1">
										{item.name}
									</p>
									<p className="text-2xl font-serif font-bold text-primary">{item.value}</p>
								</div>
							))}
						</div>
					</CardContent>
				</Card>
			</div>
		</div>
	);
}

function StatCard({ title, value, icon, description, trend, variant = "default" }: any) {
	return (
		<Card className="rounded-[2.2rem] border-primary/10 shadow-lg overflow-hidden group hover:border-primary/30 transition-all">
			<CardContent className="p-8">
				<div className="flex justify-between items-start mb-6">
					<div className={`h-12 w-12 rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110 ${variant === "default" ? "bg-primary/10 text-primary" : "bg-foreground/5 text-foreground/40"}`}>
						{icon}
					</div>
					<span className="text-[8px] font-bold uppercase tracking-wider bg-primary/5 px-3 py-1 rounded-full text-primary">
						{trend}
					</span>
				</div>
				<div className="space-y-1">
					<p className="text-[10px] font-bold uppercase tracking-widest text-foreground/40">
						{title}
					</p>
					<h3 className="text-3xl font-serif font-bold text-foreground tracking-tight">
						{value}
					</h3>
				</div>
				<p className="text-[10px] text-foreground/30 font-medium mt-4">
					{description}
				</p>
			</CardContent>
		</Card>
	);
}
