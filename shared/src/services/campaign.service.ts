import {
	collection,
	addDoc,
	getDocs,
	query,
	where,
	serverTimestamp,
	doc,
	updateDoc,
	getDoc,
} from "firebase/firestore";
import { Service } from "./service.base";
import { AppUser } from "../types/user";
import { NotificationCampaign } from "../types/campaign";
export type { NotificationCampaign };
import { emailService } from "./emails.service";
import { generateJourneyAnnouncementHtml } from "../utils/email-templates";
import { ToursService } from "./tours.service";

export class CampaignService extends Service {
	private readonly CAMPAIGN_COLLECTION = "notificationCampaigns";

	/** Get eligible registered users */
	async getEligibleUsers(): Promise<AppUser[]> {
		const q = query(
			collection(this.db, this.USERS_COLLECTION),
			where("notifications.journeyAnnouncements", "==", true),
		);
		const snap = await getDocs(q);
		return snap.docs.map((d) => d.data() as AppUser);
	}

	/** Create a new campaign */
	async createCampaign(
		data: Omit<NotificationCampaign, "createdAt" | "status" | "sentCount" | "failedCount">,
	) {
		const docRef = await addDoc(collection(this.db, this.CAMPAIGN_COLLECTION), {
			...data,
			status: "DRAFT",
			sentCount: 0,
			failedCount: 0,
			createdAt: serverTimestamp(),
		});
		return docRef.id;
	}

	/** Get campaign details */
	async getCampaign(id: string): Promise<NotificationCampaign | null> {
		const snap = await getDoc(doc(this.db, this.CAMPAIGN_COLLECTION, id));
		if (!snap.exists()) return null;
		return { id: snap.id, ...snap.data() } as NotificationCampaign;
	}

	/** Start sending campaign */
	async sendCampaign(campaignId: string) {
		const campaign = await this.getCampaign(campaignId);
		if (!campaign || campaign.status === "COMPLETED" || campaign.status === "SENDING") return;

		await updateDoc(doc(this.db, this.CAMPAIGN_COLLECTION, campaignId), {
			status: "SENDING",
			startedAt: serverTimestamp(),
		});

		const toursSvc = new ToursService();
		const tour = await toursSvc.getTourDetails(campaign.tourId);
		if (!tour) {
			await updateDoc(doc(this.db, this.CAMPAIGN_COLLECTION, campaignId), {
				status: "FAILED",
			});
			return;
		}

		const appUrl = (import.meta as any).env?.VITE_MAIN_APP_URL || "https://ambadypilgrimage.com";
		const html = generateJourneyAnnouncementHtml(tour, appUrl);

		const recipients = campaign.recipients;
		let sent = 0;
		let failed = 0;

		// Gmail limits batching. We'll send in small batches to avoid timeout and stay safe.
		const batchSize = 50;
		for (let i = 0; i < recipients.length; i += batchSize) {
			const batch = recipients.slice(i, i + batchSize).filter((r) => r.status === "PENDING");
			if (batch.length === 0) continue;

			try {
				await emailService.sendJourneyAnnouncementBatch({
					tourName: tour.name,
					recipients: batch.map((r) => r.email),
					subject: campaign.subject,
					html: html,
				});

				// Update local statuses
				batch.forEach((r) => {
					r.status = "SENT";
				});
				sent += batch.length;
			} catch (err: any) {
				console.error(`Batch starting at ${i} failed:`, err);
				batch.forEach((r) => {
					r.status = "FAILED";
					r.error = err.message;
				});
				failed += batch.length;
			}

			// Update campaign progress in Firestore
			await updateDoc(doc(this.db, this.CAMPAIGN_COLLECTION, campaignId), {
				sentCount: sent,
				failedCount: failed,
				recipients: recipients, // Update the whole array with statuses
			});
		}

		await updateDoc(doc(this.db, this.CAMPAIGN_COLLECTION, campaignId), {
			status: failed === 0 ? "COMPLETED" : "FAILED",
			completedAt: serverTimestamp(),
		});
	}

	/** Send a test email */
	async sendTestEmail(tourId: string, testEmail: string) {
		const toursSvc = new ToursService();
		const tour = await toursSvc.getTourDetails(tourId);
		if (!tour) throw new Error("Tour not found");

		const appUrl = (import.meta as any).env?.VITE_MAIN_APP_URL || "http://localhost:5175";
		const html = generateJourneyAnnouncementHtml(tour, appUrl);

		return emailService.sendJourneyAnnouncementBatch({
			tourName: tour.name,
			recipients: [testEmail],
			subject: `[TEST] ${tour.name} - Journey Announcement`,
			html,
		});
	}

	/** Retry failed deliveries */
	async retryFailedDeliveries(campaignId: string) {
		const campaign = await this.getCampaign(campaignId);
		if (!campaign || campaign.status !== "FAILED") return;

		// Mark failed recipients as PENDING again
		const updatedRecipients = campaign.recipients.map((r) =>
			r.status === "FAILED" ? { ...r, status: "PENDING" as const, error: undefined } : r,
		);

		await updateDoc(doc(this.db, this.CAMPAIGN_COLLECTION, campaignId), {
			status: "QUEUED",
			recipients: updatedRecipients,
		});

		return this.sendCampaign(campaignId);
	}
}
