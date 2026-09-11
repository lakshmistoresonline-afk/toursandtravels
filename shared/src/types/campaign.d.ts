export type CampaignStatus = "DRAFT" | "QUEUED" | "SENDING" | "COMPLETED" | "FAILED";

export interface NotificationCampaign {
	id?: string;
	type: "JOURNEY_ANNOUNCEMENT";
	tourId: string;
	subject: string;
	status: CampaignStatus;
	recipientCount: number;
	sentCount: number;
	failedCount: number;
	recipients: Array<{
		email: string;
		uid?: string;
		source: "REGISTERED" | "MANUAL";
		status: "PENDING" | "SENT" | "FAILED";
		error?: string;
	}>;
	createdBy: string;
	createdAt: any;
	startedAt?: any;
	completedAt?: any;
}
