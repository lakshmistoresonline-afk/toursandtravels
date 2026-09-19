import { ApiError } from "../utils/ApiError";

export class ResearchService {
	/**
	 * Fetches research data about a destination using public APIs (Wikipedia)
	 * and synthesizes a spiritual description.
	 * REQUIRES NO API KEYS.
	 */
	async generateSpiritualOverview(destination: string): Promise<string> {
		if (!destination) throw new ApiError("Destination is required", 400);

		try {
			// 1. Research: Fetch summary from Wikipedia
			const wikiUrl = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
				destination.trim()
			)}`;
			const response = await fetch(wikiUrl);

			let knowledge = "";
			if (response.ok) {
				const data = await response.json();
				knowledge = data.extract || "";
			}

			// 2. Synthesis: Transform knowledge into a spiritual overview
			return this.synthesize(destination, knowledge);
		} catch (err: any) {
			console.error("❌ [RESEARCH ERROR]", err);
			// Fallback to a high-quality generic spiritual overview if research fails
			return `Embark on a soul-stirring pilgrimage to the sacred landscapes of ${destination}. Experience a journey of inner reflection, divine heritage, and spiritual awakening. AMBADY PILGRIMAGE EXPERIENCES welcomes you to join us on this transformative path of faith.`;
		}
	}

	private synthesize(destination: string, knowledge: string): string {
		const dest = destination.trim();

		// Clean knowledge text
		const facts = knowledge.toLowerCase();

		// Determine the "Spiritual Path" based on research keywords
		let intro = `Discover the sacred essence of ${dest}, a destination where the divine meets the earthly.`;
		let middle = `This journey invites you to connect with the deep heritage and serene atmosphere that defines this hallowed ground.`;

		if (facts.includes("temple") || facts.includes("hindu") || facts.includes("god")) {
			intro = `Join us for a divine pilgrimage to the ancient temples and sacred altars of ${dest}.`;
			middle = `Experience the powerful spiritual vibrations and timeless traditions that have drawn seekers to this holy site for centuries.`;
		} else if (facts.includes("mountain") || facts.includes("hill") || facts.includes("nature") || facts.includes("peak")) {
			intro = `Elevate your spirit amidst the majestic heights and tranquil landscapes of ${dest}.`;
			middle = `Wander through nature's pristine cathedral on a journey of inner peace and quiet contemplation.`;
		} else if (facts.includes("river") || facts.includes("ganga") || facts.includes("water") || facts.includes("ghat")) {
			intro = `Find purification and renewal by the sacred waters and timeless banks of ${dest}.`;
			middle = `Let the rhythmic flow of the river guide you toward a state of profound spiritual clarity and grace.`;
		} else if (facts.includes("history") || facts.includes("ancient") || facts.includes("fort")) {
			intro = `Step into a living legacy of faith as we explore the ancient heritage and spiritual landmarks of ${dest}.`;
			middle = `Connect with the stories of the past and find modern inspiration in the enduring spirit of this historic sanctuary.`;
		}

		const conclusion = `AMBADY PILGRIMAGE EXPERIENCES is honored to guide you on this transformative path of inner discovery.`;

		return `${intro} ${middle} ${conclusion}`;
	}
}
