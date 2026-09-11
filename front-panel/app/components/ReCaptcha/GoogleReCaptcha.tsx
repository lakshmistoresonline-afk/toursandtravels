import { forwardRef, useImperativeHandle, useEffect } from "react";

/**
 * Google ReCaptcha Mock
 * REFACTORED: Now a no-op to remove dependency for simple mode.
 */

export async function verifyRecaptcha(_token: string) {
	return { success: true };
}

export const GoogleReCaptcha = forwardRef(({ onChange, siteKey }: any, ref) => {
	useImperativeHandle(ref, () => ({
		reset: () => {
			console.log("Mock ReCaptcha Reset");
		},
	}));

	useEffect(() => {
		// Automatically provide a mock token on mount for the mock
		onChange("mock-token");
	}, [onChange]);

	return null;
});

GoogleReCaptcha.displayName = "GoogleReCaptcha";
