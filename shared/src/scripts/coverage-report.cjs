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

async function generateReport() {
	console.log("📊 GENERATING GEOGRAPHIC COVERAGE REPORT...");

	const spotsSnap = await db.collection("spots").get();
	const spots = [];
	spotsSnap.forEach(doc => spots.push(doc.data()));

	const regions = {};

	spots.forEach(spot => {
		const reg = spot.geography.region || "Unknown";
		const state = spot.geography.stateUT || "Unknown";

		if (!regions[reg]) regions[reg] = {};
		if (!regions[reg][state]) regions[reg][state] = { spots: 0, pilgrimage: 0, tourist: 0 };

		regions[reg][state].spots++;
		if (spot.domains.includes("PILGRIMAGE")) regions[reg][state].pilgrimage++;
		if (spot.domains.includes("TOURIST")) regions[reg][state].tourist++;
	});

	let markdown = "# AMABADY Destination Geographic Coverage Report\n\n";
	markdown += "| Region | State/UT | Spots | PILGRIMAGE | TOURIST | Status |\n";
	markdown += "| :--- | :--- | ---: | ---: | ---: | :--- |\n";

	Object.keys(regions).sort().forEach(reg => {
		Object.keys(regions[reg]).sort().forEach(state => {
			const s = regions[reg][state];
			markdown += `| ${reg} | ${state} | ${s.spots} | ${s.pilgrimage} | ${s.tourist} | ${s.spots > 0 ? "✅" : "❌"} |\n`;
		});
	});

	fs.writeFileSync(path.resolve(__dirname, "../../../AMABADY_DESTINATION_GEOGRAPHIC_COVERAGE_REPORT.md"), markdown);
	console.log("✅ Report generated: AMABADY_DESTINATION_GEOGRAPHIC_COVERAGE_REPORT.md");
	process.exit(0);
}

generateReport().catch(console.error);
