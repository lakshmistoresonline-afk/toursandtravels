const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.resolve(__dirname, "../../../toursandtravels-73c62-firebase-adminsdk-fbsvc-7f445fae34.json");
const dataPath = path.resolve(__dirname, "../../../AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/01_MASTER/destinations.json");

if (!fs.existsSync(serviceAccountPath)) {
	console.error("❌ Service account file not found at:", serviceAccountPath);
	process.exit(1);
}

if (!fs.existsSync(dataPath)) {
	console.error("❌ Destination data not found at:", dataPath);
	process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
initializeApp({
	credential: cert(serviceAccount),
});

const db = getFirestore();

function normalizeAliases(aliases) {
	if (Array.isArray(aliases)) return aliases;
	if (typeof aliases === "string") return aliases.split("|").map(a => a.trim()).filter(Boolean);
	return [];
}

function generateSearchKeywords(spot) {
	const words = new Set();
	const addPhrase = (text) => {
		if (!text) return;
		const parts = text.toLowerCase().split(/[\s,/-]+/).filter(p => p.length > 1);
		parts.forEach(p => words.add(p));
	};
	addPhrase(spot.canonicalName);
	spot.aliases?.forEach(addPhrase);
	if (spot.geography) {
		addPhrase(spot.geography.cityLocality);
		addPhrase(spot.geography.district);
		addPhrase(spot.geography.stateUT);
	}
	return Array.from(words);
}

async function ingest() {
	console.log("🚀 STARTING DESTINATION INGESTION...");

	const destinations = JSON.parse(fs.readFileSync(dataPath, "utf8"));
	console.log(`🔍 Found ${destinations.length} records in harvest package.`);

	let inserted = 0;
	let updated = 0;
	let skipped = 0;
	let errors = 0;

	for (const item of destinations) {
		try {
			const spotId = item.spotId;
			if (!spotId) {
				console.warn("⚠️ Skipping record without spotId:", item.canonicalName);
				skipped++;
				continue;
			}

			const docRef = db.collection("spots").doc(spotId);
			const docSnap = await docRef.get();

			// Normalize domains and subcategory
			const domains = item.topCategory ? [item.topCategory] : [];
			const aliases = normalizeAliases(item.aliases);

			// Data Correction Patch: Nagpur record has wrong state and region
			let stateUT = item.stateUT;
			let region = item.region || "Unknown";
			if (item.spotId === "DISC-00020" && item.stateUT === "Nagpur") {
				stateUT = "Maharashtra";
				region = "West";
			}

			const spotData = {
				spotId: spotId,
				canonicalName: item.canonicalName,
				aliases: aliases,
				alternateNames: [],
				domains: domains,
				category: item.topCategory,
				subcategory: item.subcategory ? [item.subcategory] : [],
				geography: {
					region: region,
					stateUT: stateUT,
					district: item.district,
					cityLocality: item.cityLocality,
				},
				importance: item.importance || "UNRANKED",
				verification: {
					status: "DISCOVERED",
					notes: `Imported from harvest package: ${item.source}`
				},
				status: "draft",
				updatedAt: new Date().toISOString()
			};

			spotData.searchKeywords = generateSearchKeywords(spotData);

			if (docSnap.exists) {
				const existing = docSnap.data();
				if (existing.verification?.status === "VERIFIED" || existing.verification?.status === "PUBLISHED") {
					console.log(`ℹ️ Skipping verified spot: ${spotId} (${item.canonicalName})`);
					skipped++;
					continue;
				}
				await docRef.update(spotData);
				updated++;
			} else {
				spotData.createdAt = new Date().toISOString();
				await docRef.set(spotData);
				inserted++;
			}

		} catch (err) {
			console.error(`❌ Error processing ${item.spotId}:`, err.message);
			errors++;
		}
	}

	console.log("\n--- INGESTION REPORT ---");
	console.log(`✅ Records Inserted: ${inserted}`);
	console.log(`🔄 Records Updated:  ${updated}`);
	console.log(`⏭️ Records Skipped:  ${skipped}`);
	console.log(`❌ Errors:           ${errors}`);
	console.log("------------------------\n");
}

ingest().catch(err => {
	console.error("💥 Fatal Ingestion Error:", err);
	process.exit(1);
});
