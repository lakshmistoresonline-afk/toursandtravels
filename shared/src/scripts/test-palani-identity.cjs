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

async function testIdentity() {
	console.log("🧪 RUNNING PALANI IDENTITY TEST...");

	const namesToTest = [
		"Palani Murugan Temple",
		"Palani Temple",
		"Pazhani Murugan Temple",
		"Arulmigu Dhandayuthapani Swamy Temple"
	];

	const spotsRef = db.collection("spots");

	for (const name of namesToTest) {
		const q1 = await spotsRef.where("canonicalName", "==", name).get();
		const q2 = await spotsRef.where("aliases", "array-contains", name).get();

		const results = [...q1.docs, ...q2.docs];
		const uniqueIds = new Set(results.map(d => d.id));

		console.log(`🔍 Search: "${name}" -> Found: ${uniqueIds.size} unique spots. ${uniqueIds.size === 1 ? "✅" : "❌"}`);
		if (uniqueIds.size > 0) {
			console.log(`   IDs: ${Array.from(uniqueIds).join(", ")}`);
		}
	}

	process.exit(0);
}

testIdentity().catch(console.error);
