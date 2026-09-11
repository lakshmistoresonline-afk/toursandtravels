import { useLoaderData, useSubmit, useActionData, Link } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Badge } from "~/components/ui/badge";
import { Checkbox } from "~/components/ui/checkbox";
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle,
	DialogDescription,
	DialogFooter,
} from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import {
	Loader2,
	Megaphone,
	Mail,
	Plus,
	Trash2,
	Search,
	Eye,
	Send,
	ArrowLeft,
	CheckCircle2,
	XCircle,
	Users,
} from "lucide-react";
import { ToursService } from "@workspace/shared/services/tours.service";
import { CampaignService, NotificationCampaign } from "@workspace/shared/services/campaign.service";
import { generateJourneyAnnouncementHtml } from "@workspace/shared/utils/email-templates";
import { toast } from "sonner";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";

export const clientLoader = async ({ params, request }: any) => {
	const toursSvc = new ToursService();
	const campaignSvc = new CampaignService();
	const { user: admin } = await getCurrentUser(request);

	const tour = await toursSvc.getTourDetails(params.id);
	const eligibleUsers = await campaignSvc.getEligibleUsers();

	return { tour, eligibleUsers, admin };
};

export const clientAction = async ({ request, params }: any) => {
	const formData = await request.formData();
	const intent = formData.get("intent");
	const campaignSvc = new CampaignService();

	if (intent === "send-test") {
		const testEmail = formData.get("testEmail") as string;
		try {
			await campaignSvc.sendTestEmail(params.id, testEmail);
			return { success: true, message: "Test email sent successfully." };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}

	if (intent === "start-campaign") {
		const subject = formData.get("subject") as string;
		const recipientsRaw = formData.get("recipients") as string;
		const recipients = JSON.parse(recipientsRaw);
		const adminId = formData.get("adminId") as string;

		try {
			const campaignId = await campaignSvc.createCampaign({
				type: "JOURNEY_ANNOUNCEMENT",
				tourId: params.id,
				subject,
				recipientCount: recipients.length,
				recipients: recipients.map((r: any) => ({
					...r,
					status: "PENDING",
				})),
				createdBy: adminId,
			});

			// In a real app, this might be a background task or a separate process.
			// Here we'll start it and return the ID.
			campaignSvc.sendCampaign(campaignId);

			return { success: true, campaignId };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}

	return null;
};

export default function JourneyAnnouncementPage() {
	const { tour, eligibleUsers, admin } = useLoaderData<typeof clientLoader>();
	const actionData = useActionData() as any;
	const submit = useSubmit();

	const [recipients, setRecipients] = useState<any[]>([]);
	const [manualEmail, setManualEmail] = useState("");
	const [search, setSearch] = useState("");
	const [isPreviewOpen, setIsPreviewOpen] = useState(false);
	const [isConfirmOpen, setIsConfirmOpen] = useState(false);
	const [testEmail, setTestEmail] = useState(admin?.email || "");
	const [isSendingTest, setIsSendingTest] = useState(false);
	const [campaignId, setCampaignId] = useState<string | null>(null);

	// Initialize recipients from eligible users
	useEffect(() => {
		if (eligibleUsers) {
			setRecipients(
				eligibleUsers.map((u) => ({
					email: u.email,
					uid: u.uid,
					name: `${u.first_name} ${u.last_name}`,
					source: "REGISTERED",
					selected: true,
				})),
			);
		}
	}, [eligibleUsers]);

	useEffect(() => {
		if (actionData?.success) {
			if (actionData.campaignId) {
				setCampaignId(actionData.campaignId);
				setIsConfirmOpen(false);
				toast.success("Campaign started!");
			} else {
				toast.success(actionData.message);
				setIsSendingTest(false);
			}
		} else if (actionData?.error) {
			toast.error(actionData.error);
			setIsSendingTest(false);
		}
	}, [actionData]);

	const filteredRecipients = useMemo(() => {
		return recipients.filter(
			(r) =>
				r.email.toLowerCase().includes(search.toLowerCase()) ||
				r.name?.toLowerCase().includes(search.toLowerCase()),
		);
	}, [recipients, search]);

	const selectedCount = recipients.filter((r) => r.selected).length;

	const handleToggleAll = (checked: boolean) => {
		setRecipients(recipients.map((r) => ({ ...r, selected: checked })));
	};

	const handleToggleRecipient = (email: string) => {
		setRecipients(recipients.map((r) => (r.email === email ? { ...r, selected: !r.selected } : r)));
	};

	const handleAddManualEmail = () => {
		const email = manualEmail.trim().toLowerCase();
		if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
			toast.error("Invalid email address");
			return;
		}
		if (recipients.some((r) => r.email === email)) {
			toast.error("Email already in the list");
			return;
		}
		setRecipients([...recipients, { email, name: "Manual Contact", source: "MANUAL", selected: true }]);
		setManualEmail("");
	};

	const handleRemoveRecipient = (email: string) => {
		setRecipients(recipients.filter((r) => r.email !== email));
	};

	const handleSendTest = () => {
		setIsSendingTest(true);
		const formData = new FormData();
		formData.append("intent", "send-test");
		formData.append("testEmail", testEmail);
		submit(formData, { method: "post" });
	};

	const handleStartCampaign = () => {
		const selectedRecipients = recipients.filter((r) => r.selected);
		if (selectedRecipients.length === 0) {
			toast.error("No recipients selected");
			return;
		}

		const formData = new FormData();
		formData.append("intent", "start-campaign");
		formData.append("subject", `New Pilgrimage Journey: ${tour?.name}`);
		formData.append(
			"recipients",
			JSON.stringify(
				selectedRecipients.map((r) => ({
					email: r.email,
					uid: r.uid,
					source: r.source,
				})),
			),
		);
		formData.append("adminId", admin?.uid || "system");
		submit(formData, { method: "post" });
	};

	if (!tour) return null;

	const appUrl = typeof window !== "undefined" ? window.location.origin : "https://ambadypilgrimage.com";
	const previewHtml = generateJourneyAnnouncementHtml(tour as any, appUrl);

	return (
		<div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-32">
			<MetaDetails
				metaTitle="Journey Announcement | AMBADY Admin"
				metaDescription="Prepare and send pilgrimage journey announcement."
			/>

			<div className="flex items-center justify-between border-b border-primary/10 pb-8">
				<div className="flex items-center gap-4">
					<Button
						asChild
						variant="ghost"
						size="icon"
						className="rounded-full hover:bg-primary/5 text-primary"
					>
						<Link to="/admin/tours">
							<ArrowLeft className="h-5 w-5" />
						</Link>
					</Button>
					<div>
						<h1 className="text-4xl font-serif text-foreground tracking-tight leading-tight">
							Journey Announcement
						</h1>
						<p className="text-foreground/40 mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
							Prepare sacred announcement for {tour.name}
						</p>
					</div>
				</div>
			</div>

			{campaignId ? (
				<CampaignStatusReport campaignId={campaignId} onBack={() => setCampaignId(null)} />
			) : (
				<div className="grid lg:grid-cols-3 gap-10">
					{/* Left: Recipient Management */}
					<div className="lg:col-span-2 space-y-8">
						<Card className="bg-card border border-primary/10 rounded-[2.5rem] overflow-hidden shadow-xl">
							<div className="px-10 py-7 border-b border-primary/10 flex items-center justify-between bg-primary/5">
								<div className="flex items-center gap-4">
									<Users className="h-4.5 w-4.5 text-primary" />
									<h3 className="text-[11px] font-bold uppercase tracking-[0.3em] text-primary">
										Recipient Selection
									</h3>
								</div>
								<div className="flex items-center gap-4">
									<Badge className="bg-primary/10 text-primary border-primary/20 px-3 py-1 rounded-full text-[10px]">
										{selectedCount} Selected
									</Badge>
								</div>
							</div>
							<CardContent className="p-0">
								<div className="p-6 border-b border-primary/10 flex gap-4">
									<div className="relative flex-1">
										<Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
										<Input
											placeholder="Search name or email..."
											value={search}
											onChange={(e) => setSearch(e.target.value)}
											className="pl-10 h-12 rounded-xl border-primary/10 bg-background"
										/>
									</div>
									<div className="flex gap-2">
										<Button
											variant="outline"
											onClick={() => handleToggleAll(true)}
											className="rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest border-primary/10"
										>
											Select All
										</Button>
										<Button
											variant="outline"
											onClick={() => handleToggleAll(false)}
											className="rounded-xl h-12 text-[10px] font-bold uppercase tracking-widest border-primary/10"
										>
											Clear
										</Button>
									</div>
								</div>

								<div className="max-h-[600px] overflow-y-auto">
									<Table>
										<TableHeader>
											<TableRow>
												<TableHead className="w-12"></TableHead>
												<TableHead>Pilgrim / Contact</TableHead>
												<TableHead>Source</TableHead>
												<TableHead className="text-right">Action</TableHead>
											</TableRow>
										</TableHeader>
										<TableBody>
											{filteredRecipients.map((r) => (
												<TableRow key={r.email}>
													<TableCell>
														<Checkbox
															checked={r.selected}
															onCheckedChange={() =>
																handleToggleRecipient(r.email)
															}
														/>
													</TableCell>
													<TableCell>
														<div className="flex flex-col">
															<span className="font-bold">{r.name}</span>
															<span className="text-xs text-foreground/40">
																{r.email}
															</span>
														</div>
													</TableCell>
													<TableCell>
														<Badge
															variant="outline"
															className="text-[8px] uppercase tracking-widest"
														>
															{r.source}
														</Badge>
													</TableCell>
													<TableCell className="text-right">
														<Button
															variant="ghost"
															size="icon"
															onClick={() => handleRemoveRecipient(r.email)}
															className="text-red-500 hover:bg-red-50 h-8 w-8"
														>
															<Trash2 className="h-4 w-4" />
														</Button>
													</TableCell>
												</TableRow>
											))}
											{filteredRecipients.length === 0 && (
												<TableRow>
													<TableCell
														colSpan={4}
														className="h-32 text-center text-foreground/40 italic"
													>
														No recipients found
													</TableCell>
												</TableRow>
											)}
										</TableBody>
									</Table>
								</div>

								<div className="p-6 bg-primary/5 border-t border-primary/10">
									<div className="flex gap-4">
										<div className="relative flex-1">
											<Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground/40" />
											<Input
												placeholder="Add external email..."
												value={manualEmail}
												onChange={(e) => setManualEmail(e.target.value)}
												onKeyDown={(e) => e.key === "Enter" && handleAddManualEmail()}
												className="pl-10 h-12 rounded-xl border-primary/10 bg-background"
											/>
										</div>
										<Button
											onClick={handleAddManualEmail}
											className="rounded-xl h-12 bg-primary text-primary-foreground px-6"
										>
											<Plus className="h-4 w-4 mr-2" /> Add
										</Button>
									</div>
								</div>
							</CardContent>
						</Card>
					</div>

					{/* Right: Summary & Actions */}
					<div className="space-y-8">
						<Card className="bg-card border border-primary/10 rounded-[2.5rem] p-10 space-y-8 shadow-xl">
							<div className="space-y-2">
								<h3 className="text-2xl font-serif text-foreground">Campaign Summary</h3>
								<p className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold">
									Review details before sending
								</p>
							</div>

							<div className="space-y-4">
								<div className="flex justify-between py-3 border-b border-primary/5">
									<span className="text-xs text-foreground/40 font-bold uppercase tracking-widest">
										Journey
									</span>
									<span className="text-xs font-bold text-foreground text-right">
										{tour.name}
									</span>
								</div>
								<div className="flex justify-between py-3 border-b border-primary/5">
									<span className="text-xs text-foreground/40 font-bold uppercase tracking-widest">
										Recipients
									</span>
									<span className="text-xs font-bold text-primary">
										{selectedCount} Selected
									</span>
								</div>
								<div className="flex justify-between py-3 border-b border-primary/5">
									<span className="text-xs text-foreground/40 font-bold uppercase tracking-widest">
										Sender
									</span>
									<span className="text-xs font-bold text-foreground">AMBADY Gmail</span>
								</div>
							</div>

							<div className="space-y-4 pt-4">
								<Button
									variant="outline"
									className="w-full h-14 rounded-full border-primary/20 text-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-widest"
									onClick={() => setIsPreviewOpen(true)}
								>
									<Eye className="h-4 w-4 mr-3" /> Preview Email
								</Button>

								<div className="pt-8 border-t border-primary/5 space-y-4">
									<div className="space-y-2">
										<Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">
											Send Test To
										</Label>
										<div className="flex gap-2">
											<Input
												value={testEmail}
												onChange={(e) => setTestEmail(e.target.value)}
												className="h-12 rounded-xl bg-background border-primary/10 text-xs"
											/>
											<Button
												size="icon"
												className="h-12 w-12 rounded-xl bg-primary text-primary-foreground"
												onClick={handleSendTest}
												disabled={isSendingTest}
											>
												{isSendingTest ? (
													<Loader2 className="h-4 w-4 animate-spin" />
												) : (
													<Send className="h-4 w-4" />
												)}
											</Button>
										</div>
									</div>
								</div>

								<Button
									className="w-full h-20 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-[0.3em] shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-all"
									onClick={() => setIsConfirmOpen(true)}
									disabled={selectedCount === 0}
								>
									<Megaphone className="h-5 w-5 mr-3" /> Send Announcement
								</Button>
							</div>
						</Card>

						<div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-4">
							<div className="flex items-center gap-3 text-primary">
								<CheckCircle2 className="h-5 w-5" />
								<span className="text-[11px] font-bold uppercase tracking-widest">
									Verification
								</span>
							</div>
							<p className="text-xs text-foreground/60 leading-relaxed font-medium">
								We recommend sending a test email first to verify the layout and links on your
								device.
							</p>
						</div>
					</div>
				</div>
			)}

			{/* Email Preview Dialog */}
			<Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
				<DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col p-0 rounded-[3rem]">
					<DialogHeader className="p-8 bg-primary/5 border-b border-primary/10 shrink-0">
						<DialogTitle className="text-2xl font-serif">Email Preview</DialogTitle>
						<DialogDescription className="text-[10px] uppercase tracking-widest text-primary mt-1">
							This is exactly what pilgrims will receive.
						</DialogDescription>
					</DialogHeader>
					<div className="flex-1 overflow-y-auto bg-gray-100 p-8">
						<div
							className="bg-white shadow-2xl rounded-lg overflow-hidden mx-auto max-w-[600px]"
							dangerouslySetInnerHTML={{ __html: previewHtml }}
						/>
					</div>
				</DialogContent>
			</Dialog>

			{/* Final Confirmation Dialog */}
			<Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
				<DialogContent className="max-w-md rounded-[2.5rem]">
					<DialogHeader>
						<DialogTitle className="text-2xl font-serif">Confirm Announcement</DialogTitle>
						<DialogDescription className="pt-4 text-base leading-relaxed">
							You are about to send a pilgrimage journey announcement to{" "}
							<strong className="text-primary">{selectedCount}</strong> recipients. This action
							will use the AMBADY Gmail account to deliver these messages.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter className="pt-8">
						<Button
							variant="ghost"
							onClick={() => setIsConfirmOpen(false)}
							className="rounded-full h-12 px-6"
						>
							Cancel
						</Button>
						<Button
							className="rounded-full bg-primary text-primary-foreground h-12 px-10 font-bold uppercase tracking-widest text-[10px]"
							onClick={handleStartCampaign}
						>
							Yes, Send Now
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}

function CampaignStatusReport({ campaignId, onBack }: { campaignId: string; onBack: () => void }) {
	const [campaign, setCampaign] = useState<NotificationCampaign | null>(null);

	useEffect(() => {
		const campaignSvc = new CampaignService();
		// We'll use a simple polling here for V1, though onSnapshot is better
		const interval = setInterval(async () => {
			const data = await campaignSvc.getCampaign(campaignId);
			if (data) {
				setCampaign(data);
				if (data.status === "COMPLETED" || data.status === "FAILED") {
					clearInterval(interval);
				}
			}
		}, 2000);

		return () => clearInterval(interval);
	}, [campaignId]);

	if (!campaign) {
		return (
			<div className="flex flex-col items-center justify-center py-32 space-y-6">
				<Loader2 className="h-12 w-12 text-primary animate-spin" />
				<p className="text-[10px] font-bold uppercase tracking-[0.4em] text-primary">
					Initializing Campaign...
				</p>
			</div>
		);
	}

	const isFinished = campaign.status === "COMPLETED" || campaign.status === "FAILED";

	return (
		<div className="max-w-4xl mx-auto space-y-12 animate-in zoom-in-95 duration-500">
			<div className="text-center space-y-4">
				{campaign.status === "COMPLETED" ? (
					<CheckCircle2 className="h-20 w-20 text-emerald-500 mx-auto" />
				) : campaign.status === "FAILED" ? (
					<XCircle className="h-20 w-20 text-red-500 mx-auto" />
				) : (
					<Loader2 className="h-20 w-20 text-primary animate-spin mx-auto" />
				)}
				<h2 className="text-4xl font-serif text-foreground">
					{campaign.status === "SENDING"
						? "Spiritual Broadcast in Progress"
						: campaign.status === "COMPLETED"
							? "Announcement Broadcast Successful"
							: "Broadcast Encounters Difficulty"}
				</h2>
				<p className="text-[10px] text-primary uppercase tracking-[0.4em] font-bold">
					Campaign Status: {campaign.status}
				</p>
			</div>

			<div className="grid grid-cols-3 gap-8">
				<div className="bg-card p-10 rounded-[2.5rem] border border-primary/10 text-center space-y-2">
					<p className="text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
						Recipients
					</p>
					<p className="text-4xl font-serif text-foreground">{campaign.recipientCount}</p>
				</div>
				<div className="bg-card p-10 rounded-[2.5rem] border border-primary/10 text-center space-y-2">
					<p className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest">
						Successfully Sent
					</p>
					<p className="text-4xl font-serif text-emerald-500">{campaign.sentCount}</p>
				</div>
				<div className="bg-card p-10 rounded-[2.5rem] border border-primary/10 text-center space-y-2">
					<p className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest">
						Failed Deliveries
					</p>
					<p className="text-4xl font-serif text-red-500">{campaign.failedCount}</p>
				</div>
			</div>

			{isFinished && (
				<div className="flex justify-center pt-8">
					<Button
						onClick={onBack}
						className="rounded-full h-16 px-12 bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-primary/20"
					>
						Return to Sanctuary
					</Button>
				</div>
			)}

			{!isFinished && (
				<div className="space-y-4 max-w-md mx-auto">
					<div className="w-full bg-primary/10 h-2 rounded-full overflow-hidden">
						<div
							className="bg-primary h-full transition-all duration-500"
							style={{ width: `${(campaign.sentCount / campaign.recipientCount) * 100}%` }}
						/>
					</div>
					<p className="text-center text-[10px] font-bold uppercase tracking-widest text-foreground/40">
						Please keep this window open until the broadcast completes.
					</p>
				</div>
			)}
		</div>
	);
}
