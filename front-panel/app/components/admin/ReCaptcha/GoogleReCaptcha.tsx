/**
 * Google ReCaptcha Mock
 * REFACTORED: Now a no-op to remove dependency for simple mode.
 */

export async function verifyRecaptcha(_token: string) {
	return { success: true };
}

export function GoogleReCaptcha({ onChange }: any) {
	return null;
}
