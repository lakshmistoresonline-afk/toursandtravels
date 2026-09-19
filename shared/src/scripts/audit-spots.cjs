const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.resolve(__dirname, "../../../toursandtravels-73c62-firebase-adminsdk-fbsvc-7f445fae34.json");

if (!fs.existsSync(serviceAccountPath)) {
	console.error("❌ Service account file not found.");
	process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf8"));
initializeApp({
	credential: cert(serviceAccount),
});

const db = getFirestore();

async function audit() {
	console.log("🔍 STARTING MASTER DESTINATION AUDIT...");

	const spotsSnap = await db.collection("spots").get();
	console.log(`📊 Total Spots in Firestore: ${spotsSnap.size}`);

	let documentIdMismatches = 0;
	let missingKeywords = 0;
	let missingDomains = 0;

	spotsSnap.forEach(doc => {
		const data = doc.data();
		if (doc.id !== data.spotId) {
			console.warn(`⚠️ ID MISMATCH: Document ID ${doc.id} vs spotId ${data.spotId}`);
			documentIdMismatches++;
		}
		if (!data.searchKeywords || data.searchKeywords.length === 0) {
			missingKeywords++;
		}
		if (!data.domains || data.domains.length === 0) {
			missingDomains++;
		}
	});

	console.log("\n--- AUDIT RESULTS ---");
	console.log(`✅ Matches:         ${spotsSnap.size - documentIdMismatches}`);
	console.log(`❌ ID Mismatches:   ${documentIdMismatches}`);
	console.log(`❌ Missing KW:      ${missingKeywords}`);
	console.log(`❌ Missing Domains: ${missingDomains}`);
	console.log("---------------------\n");

	if (documentIdMismatches > 0 || missingKeywords > 0) {
		console.log("🛠️ RECOMMENDATION: Re-run ingestion to fix keywords and identities.");
	}

	process.exit(0);
}

audit().catch(console.error);
