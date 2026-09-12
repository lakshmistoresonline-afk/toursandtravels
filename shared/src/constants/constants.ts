/**
 * App Constants
 * REFACTORED: Removed Supabase specific constants.
 */

export const CONTACT_NUMBER_1 = "919447735336" as const;
export const EMAIL_ADDRESS_1 = "cspushpa.raman@gmail.com" as const;

export const TOUR_STATUSES = [
	"DRAFT",
	"PUBLISHED",
	"REGISTRATION_OPEN",
	"REGISTRATION_CLOSED",
	"CANCELLED",
	"COMPLETED",
] as const;
export const REGISTRATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;

export const BOOKING_STATUS = REGISTRATION_STATUSES;
export const PAYMENT_STATUS = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

export const PAYMENT_CURRENCY = "INR" as const;

export const PAYMENT_MODES = ["CASH", "GPAY", "OTHER_UPI"] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const MAX_META_KEYWORDS = 25;

// Fallback image
export const PLACEHOLDER_TOUR_IMAGE = "/placeholder-tour.jpg";

// Sorting
export const fpDefaultTourSortByFilter = "createdAt";
export const fpDefaultTourSortTypeFilter = "desc";
