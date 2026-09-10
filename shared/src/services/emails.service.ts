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
	}: {
		from: string;
		to: string | string[];
		subject: string;
		text?: string;
	}) {
		console.log("📧 [EMAIL LOG]");
		console.log(`From: ${from}`);
		console.log(`To: ${to}`);
		console.log(`Subject: ${subject}`);
		console.log(`Body: ${text || "(No text content)"}`);
		return { id: "logged-to-console" };
	}

	/** Send inquiry from website visitor */
	public async sendInquiry(payload: any) {
		const { full_name, email, subject, message } = payload;
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <inquiries@ambadypilgrimage.com>`,
			to: EMAIL_ADDRESS_1,
			subject: `New Inquiry: ${subject}`,
			text: `New Inquiry from ${full_name} (${email})\n\nSubject: ${subject}\n\nMessage: ${message}`,
		});
	}

	/** Send email to agency when a new registration is created */
	public async sendSoftBookingCreationEmail(payload: any) {
		const { booking_ref, customer_email, customer_name, total, customer_phone, tour_name } = payload;
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <bookings@ambadypilgrimage.com>`,
			to: EMAIL_ADDRESS_1,
			subject: `New Registration: #${booking_ref} - ${tour_name}`,
			text: `A new pilgrimage journey registration has been placed!\n\nReference: ${booking_ref}\nCustomer: ${customer_name} (${customer_email}, ${customer_phone})\nTotal: $${total?.toFixed(2)}`,
		});
	}

	/** Send confirmation email to customer */
	public async sendBookingConfirmation(payload: any) {
		const { booking_ref, customer_name, customer_email } = payload;
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <bookings@ambadypilgrimage.com>`,
			to: customer_email,
			subject: `Registration Confirmed – #${booking_ref}`,
			text: `Dear ${customer_name},\n\nYour registration #${booking_ref} has been confirmed.\n\nThank you for choosing AMBADY PILGRIMAGE EXPERIENCES!`,
		});
	}

	/** Send password reset link email */
	public async sendPasswordResetLink(recoveryLink: string, email: string) {
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <no-reply@ambadypilgrimage.com>`,
			to: email,
			subject: `Password Reset Request - AMBADY PILGRIMAGE EXPERIENCES`,
			text: `Your password reset link: ${recoveryLink}`,
		});
	}

	/** Send otp for admin login */
	public async sendAdminLoginOtpEmail(code: string, email: string) {
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <no-reply@ambadypilgrimage.com>`,
			to: email,
			subject: `Login Verification Code - AMBADY PILGRIMAGE EXPERIENCES`,
			text: `Your login verification code is: ${code}`,
		});
	}

	/** Send welcome email on signup */
	public async sendWelcomeEmail(firstName: string, email: string) {
		return this.sendEmail({
			from: `AMBADY PILGRIMAGE EXPERIENCES <no-reply@ambadypilgrimage.com>`,
			to: email,
			subject: `👋 Welcome to AMBADY PILGRIMAGE EXPERIENCES, ${firstName}!`,
			text: `Welcome to AMBADY PILGRIMAGE EXPERIENCES, ${firstName}! We're excited to have you on board.`,
		});
	}
}

export const emailService = EmailService.getInstance();
