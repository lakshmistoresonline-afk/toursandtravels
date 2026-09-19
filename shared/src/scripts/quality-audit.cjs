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
	console.log("🔍 STARTING FINAL DATA QUALITY AUDIT...");

	const spotsSnap = await db.collection("spots").get();
	const spots = [];
	spotsSnap.forEach(doc => spots.push(doc.data()));

	const issues = {
		missingCanonicalName: 0,
		missingSpotId: 0,
		missingDomains: 0,
		invalidDomain: 0,
		missingRegion: 0,
		missingStateUT: 0,
		missingDistrict: 0,
		missingCityLocality: 0,
		malformedAliases: 0,
		invalidCoordinates: 0,
		missingDescriptions: 0,
	};

	spots.forEach(spot => {
		if (!spot.canonicalName) issues.missingCanonicalName++;
		if (!spot.spotId) issues.missingSpotId++;
		if (!spot.domains || spot.domains.length === 0) issues.missingDomains++;
		else if (spot.domains.some(d => !["PILGRIMAGE", "TOURIST"].includes(d))) issues.invalidDomain++;

		if (!spot.geography?.region || spot.geography.region === "Unknown") issues.missingRegion++;
		if (!spot.geography?.stateUT) issues.missingStateUT++;
		if (!spot.geography?.district) issues.missingDistrict++;
		if (!spot.geography?.cityLocality) issues.missingCityLocality++;

		if (!Array.isArray(spot.aliases)) issues.malformedAliases++;

		if (spot.latitude && (spot.latitude < -90 || spot.latitude > 90)) issues.invalidCoordinates++;
		if (spot.longitude && (spot.longitude < -180 || spot.longitude > 180)) issues.invalidCoordinates++;

		if (!spot.description) issues.missingDescriptions++;
	});

	let markdown = "# AMABADY Destination Final Data Quality Report\n\n";
	markdown += `Total records: ${spots.length}\n\n`;
	markdown += "| Metric | Count | Status |\n";
	markdown += "| :--- | ---: | :--- |\n";
	markdown += `| Missing Canonical Name | ${issues.missingCanonicalName} | ${issues.missingCanonicalName === 0 ? "✅" : "❌"} |\n`;
	markdown += `| Missing Spot ID | ${issues.missingSpotId} | ${issues.missingSpotId === 0 ? "✅" : "❌"} |\n`;
	markdown += `| Missing Domains | ${issues.missingDomains} | ${issues.missingDomains === 0 ? "✅" : "❌"} |\n`;
	markdown += `| Invalid Domains | ${issues.invalidDomain} | ${issues.invalidDomain === 0 ? "✅" : "❌"} |\n`;
	markdown += `| Missing/Unknown Region | ${issues.missingRegion} | ${issues.missingRegion === 0 ? "✅" : "⚠️"} |\n`;
	markdown += `| Missing State/UT | ${issues.missingStateUT} | ${issues.missingStateUT === 0 ? "✅" : "❌"} |\n`;
	markdown += `| Missing District | ${issues.missingDistrict} | ${issues.missingDistrict === 0 ? "✅" : "⚠️"} |\n`;
	markdown += `| Missing City/Locality | ${issues.missingCityLocality} | ${issues.missingCityLocality === 0 ? "✅" : "❌"} |\n`;
	markdown += `| Malformed Aliases | ${issues.malformedAliases} | ${issues.malformedAliases === 0 ? "✅" : "❌"} |\n`;
	markdown += `| Invalid Coordinates | ${issues.invalidCoordinates} | ${issues.invalidCoordinates === 0 ? "✅" : "❌"} |\n`;
	markdown += `| Missing Descriptions | ${issues.missingDescriptions} | ${issues.missingDescriptions === 0 ? "✅" : "⚠️"} |\n`;

	fs.writeFileSync(path.resolve(__dirname, "../../../AMABADY_DESTINATION_FINAL_DATA_QUALITY_REPORT.md"), markdown);
	console.log("✅ Report generated: AMABADY_DESTINATION_FINAL_DATA_QUALITY_REPORT.md");
	process.exit(0);
}

audit().catch(console.error);
