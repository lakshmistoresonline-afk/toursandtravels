import { EMAIL_ADDRESS_1 } from "@workspace/shared/constants/constants";

/**
 * Email Service
 * REFACTORED: Now a no-op service that logs to console to remove Resend dependency.
 */
class EmailService {
	private static instance: EmailService | null = null;

	public static getInstance(): EmailService {
		if (!EmailService.instance) {
			EmailService.instance = new EmailService();
		}
		return EmailService.instance;
	}

	private async sendEmail({
		from,
		to,
		subject,
		text,
		html,
	}: {
		from: string;
		to: string | string[];
		subject: string;
		text?: string;
		html?: string;
	}) {
		const gasUrl = (import.meta as any).env?.VITE_GMAIL_APPS_SCRIPT_URL;
		const gasSecret = (import.meta as any).env?.VITE_GMAIL_APPS_SCRIPT_SECRET;

		console.log(`✉️ Transmission: Sending email to ${to}...`);

		if (gasUrl) {
			try {
				// Use 'text/plain' as Content-Type. This is a "Simple Request" that
				// avoids CORS preflight (OPTIONS) which Google Apps Script doesn't handle.
				const response = await fetch(gasUrl, {
					method: "POST",
					headers: {
						"Content-Type": "text/plain",
					},
					body: JSON.stringify({
						action: "sendEmail",
						secret: gasSecret,
						from,
						to: Array.isArray(to) ? to.join(",") : to,
						subject,
						text,
						html,
					}),
				});

				// We can read the response if the server (GAS) allows our origin,
				// which it does by default for Web Apps.
				const result = await response.json();

				if (!result.success) {
					console.warn("⚠️ Gateway reported an issue:", result.error);
					throw new Error(result.error);
				}

				return { id: result.messageId || "sent-via-gateway" };
			} catch (err: any) {
				console.error("❌ Transmission Error:", err.message);
				// Fallback to console log in dev
				this.logEmail({ from, to, subject, text });
				return { id: "logged-to-console-fallback" };
			}
		}

		this.logEmail({ from, to, subject, text });
		return { id: "logged-to-console" };
	}

	private logEmail({ from, to, subject, text }: any) {
		console.log("📧 [EMAIL LOG]");
		console.log(`From: ${from}`);
		console.log(`To: ${to}`);
		console.log(`Subject: ${subject}`);
		console.log(`Body: ${text || "(No text content)"}`);
	}

	/** Send journey announcement campaign batch */
	public async sendJourneyAnnouncementBatch(payload: {
		tourName: string;
		recipients: string[];
		subject: string;
		html: string;
	}) {
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <${EMAIL_ADDRESS_1}>`,
			to: payload.recipients,
			subject: payload.subject,
			html: payload.html,
		});
	}

	/** Send inquiry from website visitor */
	public async sendInquiry(payload: any) {
		const { full_name, email, subject, message } = payload;
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <${EMAIL_ADDRESS_1}>`,
			to: EMAIL_ADDRESS_1,
			subject: `New Inquiry: ${subject}`,
			text: `New Inquiry from ${full_name} (${email})\n\nSubject: ${subject}\n\nMessage: ${message}`,
		});
	}

	/** Send email to agency when a new registration is created */
	public async sendSoftBookingCreationEmail(payload: any) {
		const { booking_ref, customer_email, customer_name, total, customer_phone, tour_name } = payload;
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <${EMAIL_ADDRESS_1}>`,
			to: EMAIL_ADDRESS_1,
			subject: `New Registration: #${booking_ref} - ${tour_name}`,
			text: `A new pilgrimage journey registration has been placed!\n\nReference: ${booking_ref}\nCustomer: ${customer_name} (${customer_email}, ${customer_phone})\nTotal: ₹${total?.toLocaleString()}`,
		});
	}

	/** Send confirmation email to customer */
	public async sendBookingConfirmation(payload: any) {
		const { booking_ref, customer_name, customer_email, tour_name, travellersCount } = payload;
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <${EMAIL_ADDRESS_1}>`,
			to: customer_email,
			subject: `Registration Confirmed – #${booking_ref}`,
			text: `Dear ${customer_name},\n\nYour registration for the ${tour_name} journey has been confirmed for ${travellersCount} pilgrims.\n\nRegistration Reference: #${booking_ref}\n\nThank you for choosing AMBADY PILGRIMAGE EXPERIENCES! We are honored to guide you on this path.`,
		});
	}

	/** Send payment receipt to customer */
	public async sendPaymentReceipt(payload: any) {
		const { booking_ref, customer_name, customer_email, tour_name, amount } = payload;
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <${EMAIL_ADDRESS_1}>`,
			to: customer_email,
			subject: `Payment Received – Registration #${booking_ref}`,
			text: `Dear ${customer_name},\n\nWe have successfully received your payment of ₹${amount?.toLocaleString()} for the ${tour_name} journey.\n\nThis receipt is for your registration #${booking_ref}.\n\nYour place is now fully secured. We look forward to seeing you on the path!`,
		});
	}

	/** Send alert to admin about new registration */
	public async sendAdminNewRegistrationAlert(payload: any) {
		const { booking_ref, customer_name, customer_email, tour_name, travellersCount } = payload;
		return this.sendEmail({
			from: `AMBADY SYSTEM <${EMAIL_ADDRESS_1}>`,
			to: EMAIL_ADDRESS_1,
			subject: `🔔 New Registration: ${tour_name} - #${booking_ref}`,
			text: `A new pilgrim has registered!\n\nJourney: ${tour_name}\nReference: #${booking_ref}\nPilgrim: ${customer_name} (${customer_email})\nCount: ${travellersCount} pilgrims\n\nPlease review the details in the Admin Dashboard.`,
		});
	}

	/** Send password reset link email */
	public async sendPasswordResetLink(recoveryLink: string, email: string) {
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <${EMAIL_ADDRESS_1}>`,
			to: email,
			subject: `Password Reset Request - AMBADY PILGRIMAGE EXPERIENCES`,
			text: `Your password reset link: ${recoveryLink}`,
		});
	}

	/** Send otp for admin login */
	public async sendAdminLoginOtpEmail(code: string, email: string) {
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <${EMAIL_ADDRESS_1}>`,
			to: email,
			subject: `Login Verification Code - AMBADY PILGRIMAGE EXPERIENCES`,
			text: `Your login verification code is: ${code}`,
		});
	}

	/** Send welcome email on signup */
	public async sendWelcomeEmail(firstName: string, email: string) {
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <${EMAIL_ADDRESS_1}>`,
			to: email,
			subject: `👋 Welcome to AMBADY PILGRIMAGE EXPERIENCES, ${firstName}!`,
			text: `Welcome to AMBADY PILGRIMAGE EXPERIENCES, ${firstName}! We're excited to have you on board.`,
		});
	}
}

export const emailService = EmailService.getInstance();

