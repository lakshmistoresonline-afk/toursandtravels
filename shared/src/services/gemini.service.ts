import { ApiError } from "../utils/ApiError";

export class GeminiService {
	private readonly apiKey: string;
	private readonly models = ["gemini-1.5-flash", "gemini-1.5-pro", "gemini-pro"];

	constructor() {
		// Try Gemini specific key first, then fallback to Firebase key
		this.apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || (import.meta as any).env?.VITE_FIREBASE_API_KEY || "";
	}

	async generateJourneyOverview(destination: string): Promise<string> {
		if (!this.apiKey) {
			throw new ApiError("Gemini API key is not configured.", 400);
		}

		const prompt = `Write a professional and spiritual 3-sentence overview for a pilgrimage journey to ${destination}.
		The tone should be sacred, meaningful, and inviting.
		Start directly with the description. Do not use quotes.
		The website name is AMBADY PILGRIMAGE EXPERIENCES.`;

		let lastError = null;

		for (const model of this.models) {
			try {
				// Using v1 stable endpoint
				const baseUrl = `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent`;
				console.log(`✨ [GEMINI] Attempting generation with model: ${model}...`);

				const response = await fetch(`${baseUrl}?key=${this.apiKey}`, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						contents: [
							{
								parts: [{ text: prompt }],
							},
						],
						generationConfig: {
							temperature: 0.7,
							topK: 40,
							topP: 0.95,
							maxOutputTokens: 200,
						},
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					console.warn(`⚠️ [GEMINI] Model ${model} failed:`, errorData.error?.message);
					lastError = new Error(errorData.error?.message || "Failed to generate content");
					continue;
				}

				const data = await response.json();
				const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

				if (!text) {
					console.warn(`⚠️ [GEMINI] Model ${model} returned empty content.`);
					continue;
				}

				console.log(`✅ [GEMINI] Generation successful with model: ${model}`);
				return text.trim();
			} catch (err: any) {
				console.error(`❌ [GEMINI ERROR] with model ${model}:`, err.message);
				lastError = err;
			}
		}

		throw new ApiError(lastError?.message || "All Gemini models failed. Please verify API key permissions in Google Cloud Console.", 500);
	}
}
