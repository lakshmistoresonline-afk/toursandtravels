/**
 * App Constants
 * REFACTORED: Removed Supabase specific constants.
 */
export const CONTACT_NUMBER_1 = "971556130581";
export const EMAIL_ADDRESS_1 = "ambady.pilgrimage@gmail.com";
export const TOUR_STATUSES = [
	"DRAFT",
	"PUBLISHED",
	"REGISTRATION_OPEN",
	"REGISTRATION_CLOSED",
	"CANCELLED",
	"COMPLETED",
];
export const REGISTRATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"];
export const BOOKING_STATUS = REGISTRATION_STATUSES;
export const PAYMENT_STATUS = ["PENDING", "PAID", "FAILED", "REFUNDED"];
export const PAYMENT_CURRENCY = "INR";
export const MAX_META_KEYWORDS = 25;
// Fallback image
export const PLACEHOLDER_TOUR_IMAGE = "/placeholder-tour.jpg";
// Sorting
export const fpDefaultTourSortByFilter = "createdAt";
export const fpDefaultTourSortTypeFilter = "desc";
