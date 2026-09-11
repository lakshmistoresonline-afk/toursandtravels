import { z } from "zod";
export const signupSchema = z.object({
	firstName: z
		.string()
		.min(1, "First name is required")
		.max(50, "First name cannot exceed 50 characters")
		.refine((val) => val.trim().length > 0, {
			message: "First name is required",
		}),
	lastName: z
		.string()
		.min(1, "Last name is required")
		.max(50, "Last name cannot exceed 50 characters")
		.refine((val) => val.trim().length > 0, {
			message: "Last name is required",
		}),
	email: z
		.string()
		.min(1, "Email is required")
		.email("Please enter a valid email address")
		.refine((val) => val.trim().length > 0, {
			message: "Email is required",
		}),
	phone: z
		.string()
		.min(1, "Phone number is required")
		.regex(/^[6-9][0-9]{9}$/, "Please enter a valid 10-digit Indian mobile number"),
	aadharNumber: z
		.string()
		.min(1, "Aadhar number is required")
		.regex(/^\d{12}$/, "Aadhar number must be exactly 12 digits"),
	gender: z.enum(["Male", "Female", "Other", "Prefer not to say"], {
		error_map: () => ({ message: "Please select your gender" }),
	}),
	dateOfBirth: z
		.string()
		.min(1, "Date of birth is required")
		.refine((val) => {
			const date = new Date(val);
			return !isNaN(date.getTime()) && date <= new Date();
		}, "Date of birth cannot be in the future"),
	password: z
		.string({ required_error: "Password is required" })
		.min(8, "Password must be at least 8 characters long")
		.regex(
			/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/,
			"Password must contain at least one uppercase letter, one lowercase letter, and one number",
		),
});
