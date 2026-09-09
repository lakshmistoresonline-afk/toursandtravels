/**
 * App Constants
 * REFACTORED: Removed Supabase specific constants.
 */

export const CONTACT_NUMBER_1 = "971556130581" as const;
export const EMAIL_ADDRESS_1 = "wandernest@gmail.com" as const;

export const TOUR_STATUSES = ["DRAFT", "PUBLISHED", "REGISTRATION_OPEN", "REGISTRATION_CLOSED", "CANCELLED", "COMPLETED"] as const;
export const REGISTRATION_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;

export const BOOKING_STATUS = REGISTRATION_STATUSES;
export const PAYMENT_STATUS = ["PENDING", "PAID", "FAILED", "REFUNDED"] as const;

export const PAYMENT_CURRENCY = "AED" as const;

export const MAX_META_KEYWORDS = 25;

// Fallback image
export const PLACEHOLDER_TOUR_IMAGE = "/placeholder-tour.jpg";
