import { useLoaderData, useSubmit, useActionData } from "react-router";
import { useState, useEffect, useMemo } from "react";
import { MetaDetails } from "~/components/SEO/MetaDetails";
import { Button } from "~/components/ui/button";
import { BackButton } from "~/components/ui/back-button";
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
} from "~/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table";
import {
	Loader2,
	Mail,
	Plus,
	Trash2,
	Search,
	Eye,
	Send,
	Users,
	Copy,
	Check,
	Download,
} from "lucide-react";
import { ToursService } from "@workspace/shared/services/tours.service";
import { CampaignService } from "@workspace/shared/services/campaign.service";
import {
	generateJourneyAnnouncementHtml,
	generateJourneyAnnouncementText,
} from "@workspace/shared/utils/email-templates";
import { toast } from "sonner";
import { getCurrentUser } from "@workspace/shared/queries/auth.q";
import * as XLSX from "xlsx";
import { format } from "date-fns";

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
			return { success: true, message: "Test email sent successfully via Gateway." };
		} catch (err: any) {
			return { success: false, error: err.message };
		}
	}

	if (intent === "broadcast") {
		const recipientsData = JSON.parse(formData.get("recipients") as string);
		const subject = formData.get("subject") as string;
		const adminUid = formData.get("adminUid") as string;

		try {
			const campaignId = await campaignSvc.createCampaign({
				type: "JOURNEY_ANNOUNCEMENT",
				tourId: params.id,
				subject,
				recipientCount: recipientsData.length,
				recipients: recipientsData.map((r: any) => ({
					email: r.email,
					uid: r.uid,
					source: r.source,
					status: "PENDING",
				})),
				createdBy: adminUid,
			});

			// Trigger sending
			await campaignSvc.sendCampaign(campaignId);

			return {
				success: true,
				message: `Broadcast successfully sent to ${recipientsData.length} pilgrims!`,
			};
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
	const [isBroadcasting, setIsBroadcasting] = useState(false);
	const [copiedEmails, setCopiedEmails] = useState(false);
	const [copiedTemplate, setCopiedTemplate] = useState(false);
	const [copiedText, setCopiedText] = useState(false);

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
			toast.success(actionData.message);
			setIsSendingTest(false);
			setIsBroadcasting(false);
			setIsConfirmOpen(false);
		} else if (actionData?.error) {
			toast.error(actionData.error);
			setIsSendingTest(false);
			setIsBroadcasting(false);
		}
	}, [actionData]);

	const filteredRecipients = useMemo(() => {
		return recipients.filter(
			(r) =>
				r.email.toLowerCase().includes(search.toLowerCase()) ||
				r.name?.toLowerCase().includes(search.toLowerCase()),
		);
	}, [recipients, search]);

	const selectedRecipients = useMemo(() => recipients.filter((r) => r.selected), [recipients]);
	const selectedCount = selectedRecipients.length;

	const bccList = useMemo(
		() => selectedRecipients.map((r) => r.email).join(", "),
		[selectedRecipients],
	);

	const handleToggleAll = (checked: boolean) => {
		setRecipients(recipients.map((r) => ({ ...r, selected: checked })));
	};

	const handleToggleRecipient = (email: string) => {
		setRecipients(
			recipients.map((r) => (r.email === email ? { ...r, selected: !r.selected } : r)),
		);
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
		setRecipients([
			...recipients,
			{ email, name: "Manual Contact", source: "MANUAL", selected: true },
		]);
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

	const handleBroadcast = () => {
		if (selectedCount === 0) {
			toast.error("No recipients selected");
			return;
		}
		setIsBroadcasting(true);
		const formData = new FormData();
		formData.append("intent", "broadcast");
		formData.append("recipients", JSON.stringify(selectedRecipients));
		formData.append("subject", `New Pilgrimage Journey: ${tour.name}`);
		formData.append("adminUid", admin?.uid || "");
		submit(formData, { method: "post" });
	};

	const handleCopyEmails = () => {
		if (selectedCount === 0) {
			toast.error("No recipients selected");
			return;
		}
		navigator.clipboard.writeText(bccList);
		setCopiedEmails(true);
		toast.success("Recipients copied in BCC format!");
		setTimeout(() => setCopiedEmails(false), 2000);
	};

	const appUrl =
		typeof window !== "undefined" ? window.location.origin : "https://ambadypilgrimage.com";
	const previewHtml = generateJourneyAnnouncementHtml(tour as any, appUrl);
	const previewText = generateJourneyAnnouncementText(tour as any, appUrl);

	const handleCopyTemplate = () => {
		// Try to copy the HTML version if possible, otherwise text
		const blob = new Blob([previewHtml], { type: "text/html" });
		const data = [new ClipboardItem({ "text/html": blob, "text/plain": blob })];

		try {
			navigator.clipboard.write(data);
			setCopiedTemplate(true);
			toast.success("Branded email template copied!");
			setTimeout(() => setCopiedTemplate(false), 2000);
		} catch (err) {
			// Fallback to text copy
			navigator.clipboard.writeText(previewHtml);
			toast.success("HTML source copied!");
		}
	};

	const handleCopyText = () => {
		navigator.clipboard.writeText(previewText);
		setCopiedText(true);
		toast.success("Text summary copied!");
		setTimeout(() => setCopiedText(false), 2000);
	};

	const handleExportExcel = () => {
		if (selectedCount === 0) {
			toast.error("No recipients selected");
			return;
		}

		const exportData = selectedRecipients.map((r) => ({
			Name: r.name,
			Email: r.email,
			Source: r.source,
			"Formatted for Gmail (Copy All)": bccList,
		}));

		const worksheet = XLSX.utils.json_to_sheet(exportData);
		const workbook = XLSX.utils.book_new();
		XLSX.utils.book_append_sheet(workbook, worksheet, "Recipients");
		XLSX.writeFile(
			workbook,
			`AMBADY_Announcement_${tour?.tour_code || "Journey"}_${format(new Date(), "yyyyMMdd")}.xlsx`,
		);
	};

	if (!tour) return null;

	return (
		<div className="flex flex-col gap-10 animate-in fade-in duration-500 max-w-7xl mx-auto pb-32">
			<MetaDetails
				metaTitle="Journey Announcement | AMBADY Admin"
				metaDescription="Prepare and send pilgrimage journey announcement."
			/>

			<div className="flex items-center justify-between border-b border-primary/10 pb-8">
				<div className="flex items-center gap-4">
					<BackButton fallbackUrl="/admin/tours" />
					<div>
						<h1 className="text-4xl font-serif text-foreground tracking-tight leading-tight">
							Journey Announcement
						</h1>
						<p className="text-foreground/40 mt-2 text-[10px] font-bold uppercase tracking-[0.3em]">
							Prepare Announcement for {tour.name}
						</p>
					</div>
				</div>
			</div>

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
														onCheckedChange={() => handleToggleRecipient(r.email)}
													/>
												</TableCell>
												<TableCell>
													<div className="flex flex-col">
														<span className="font-bold">{r.name}</span>
														<span className="text-xs text-foreground/40">{r.email}</span>
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
							<h3 className="text-2xl font-serif text-foreground">Prepare Broadcast</h3>
							<p className="text-[10px] text-primary uppercase tracking-[0.2em] font-bold">
								Generate and copy for Gmail
							</p>
						</div>

						<div className="space-y-4">
							<Button
								className="w-full h-16 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 text-[11px] font-bold uppercase tracking-widest shadow-2xl shadow-primary/30 hover:scale-105 transition-all"
								onClick={() => setIsConfirmOpen(true)}
								disabled={isBroadcasting || selectedCount === 0}
							>
								{isBroadcasting ? (
									<Loader2 className="h-5 w-5 mr-3 animate-spin" />
								) : (
									<Send className="h-5 w-5 mr-3" />
								)}
								Send Official Broadcast ({selectedCount})
							</Button>

							<Button
								variant="outline"
								className="w-full h-14 rounded-full border-primary/20 text-primary hover:bg-primary/5 text-[10px] font-bold uppercase tracking-widest"
								onClick={() => setIsPreviewOpen(true)}
							>
								<Eye className="h-4 w-4 mr-3" /> Preview Branded Template
							</Button>

							<div className="pt-6 border-t border-primary/5">
								<p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mb-4 ml-2">
									Manual Fallback (Gmail)
								</p>
								<div className="grid grid-cols-2 gap-3">
									<Button
										variant="ghost"
										className="h-12 rounded-xl bg-white border border-primary/10 text-primary hover:bg-primary/5 text-[9px] font-bold uppercase tracking-widest"
										onClick={handleCopyEmails}
									>
										{copiedEmails ? (
											<Check className="h-3.5 w-3.5 mr-2 text-emerald-500" />
										) : (
											<Copy className="h-3.5 w-3.5 mr-2" />
										)}
										Copy BCC
									</Button>
									<Button
										variant="ghost"
										className="h-12 rounded-xl bg-white border border-primary/10 text-primary hover:bg-primary/5 text-[9px] font-bold uppercase tracking-widest"
										onClick={handleCopyTemplate}
									>
										{copiedTemplate ? (
											<Check className="h-3.5 w-3.5 mr-2 text-emerald-500" />
										) : (
											<Copy className="h-3.5 w-3.5 mr-2" />
										)}
										Copy Template
									</Button>
								</div>
							</div>

							<div className="pt-8 border-t border-primary/5 space-y-4">
								<div className="space-y-2">
									<Label className="text-[10px] font-bold uppercase tracking-widest text-foreground/40 ml-2">
										Verify Layout (Gateway)
									</Label>
									<div className="flex gap-2">
										<Input
											value={testEmail}
											onChange={(e) => setTestEmail(e.target.value)}
											className="h-12 rounded-xl bg-background border-primary/10 text-xs"
											placeholder="Test email address"
										/>
										<Button
											size="icon"
											className="h-12 w-12 rounded-xl bg-primary text-primary-foreground shrink-0"
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
						</div>
					</Card>

					<div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-8 space-y-4">
						<div className="flex items-center gap-3 text-primary">
							<Check className="h-5 w-5" />
							<span className="text-[11px] font-bold uppercase tracking-widest">
								Gmail Flow
							</span>
						</div>
						<ol className="text-[10px] text-foreground/60 leading-relaxed font-medium list-decimal pl-4 space-y-2">
							<li>Copy recipients using the button above.</li>
							<li>In Gmail, paste them into the <strong>BCC</strong> field.</li>
							<li>Copy the branded template and paste it into the compose window.</li>
							<li>Add a subject: <strong>New Pilgrimage Journey: {tour.name}</strong></li>
							<li>Send your Broadcast.</li>
						</ol>
					</div>
				</div>
			</div>

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
				<DialogContent className="max-w-md p-0 rounded-[2.5rem] overflow-hidden">
					<DialogHeader className="p-10 bg-primary/5 border-b border-primary/10">
						<DialogTitle className="text-2xl font-serif">Confirm Broadcast</DialogTitle>
						<DialogDescription className="text-[10px] font-bold uppercase tracking-widest text-primary mt-2">
							Final verification before Broadcast.
						</DialogDescription>
					</DialogHeader>
					<div className="p-10 space-y-6">
						<p className="text-sm text-foreground/70 leading-relaxed font-medium">
							You are about to send an automated journey announcement to{" "}
							<span className="text-primary font-bold">{selectedCount} pilgrims</span>.
						</p>
						<p className="text-[11px] text-foreground/40 italic">
							* Each email will be sent individually via the secure AMBADY Gateway.
						</p>
						<div className="flex flex-col gap-3 pt-4">
							<Button
								onClick={handleBroadcast}
								disabled={isBroadcasting}
								className="h-14 rounded-full bg-primary text-primary-foreground font-bold uppercase tracking-widest text-[11px] shadow-2xl"
							>
								{isBroadcasting ? (
									<Loader2 className="h-4 w-4 mr-2 animate-spin" />
								) : (
									<Send className="h-4 w-4 mr-2" />
								)}
								Confirm & Send Broadcast
							</Button>
							<Button
								variant="ghost"
								onClick={() => setIsConfirmOpen(false)}
								className="h-12 rounded-full text-foreground/40 text-[10px] font-bold uppercase tracking-widest"
							>
								Cancel
							</Button>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}



