import { ApiError } from "../utils/ApiError";

export class GeminiService {
	private readonly apiKey: string;
	private readonly baseUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

	constructor() {
		this.apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY || "";
	}

	async generateJourneyOverview(destination: string): Promise<string> {
		if (!this.apiKey) {
			throw new ApiError("Gemini API key is not configured.", 400);
		}

		const prompt = `Write a professional and spiritual 3-sentence overview for a pilgrimage journey to ${destination}.
		The tone should be sacred, meaningful, and inviting.
		Start directly with the description. Do not use quotes.
		The website name is AMBADY PILGRIMAGE EXPERIENCES.`;

		try {
			const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
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
				throw new Error(errorData.error?.message || "Failed to generate content");
			}

			const data = await response.json();
			const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

			if (!text) {
				throw new Error("No content generated");
			}

			return text.trim();
		} catch (err: any) {
			console.error("❌ [GEMINI ERROR]", err);
			throw new ApiError(err.message, 500);
		}
	}
}
