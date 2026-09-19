const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../../../");
const SERVICE_ACCOUNT_PATH = path.join(ROOT_DIR, "toursandtravels-73c62-firebase-adminsdk-fbsvc-7f445fae34.json");

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function detect() {
    console.log("🔍 DETECTING DUPLICATES...");
    const snap = await db.collection("spots").get();
    const spots = [];
    snap.forEach(doc => spots.push(doc.data()));

    const nameCityMap = {};
    const duplicateGroups = [];

    spots.forEach(spot => {
        const key = `${spot.canonicalName.toLowerCase()}|${spot.geography.cityLocality.toLowerCase()}`;
        if (!nameCityMap[key]) nameCityMap[key] = [];
        nameCityMap[key].push(spot);
    });

    Object.entries(nameCityMap).forEach(([key, group]) => {
        if (group.length > 1) {
            duplicateGroups.push(group);
        }
    });

    let markdown = "# AMABADY Duplicate Review Report\n\n";
    markdown += `Total duplicate groups found: ${duplicateGroups.length}\n\n`;

    if (duplicateGroups.length === 0) {
        markdown += "✅ No potential duplicates detected based on Name + City match.\n";
    } else {
        duplicateGroups.forEach((group, index) => {
            markdown += `### Group #${index + 1}\n`;
            group.forEach(s => {
                markdown += `- **${s.canonicalName}** (${s.spotId}) - ${s.geography.cityLocality}, ${s.geography.stateUT}\n`;
            });
            markdown += "\n";
        });
    }

    fs.writeFileSync(path.join(ROOT_DIR, "AMABADY_DUPLICATE_REVIEW_REPORT.md"), markdown);
    console.log("✅ Report generated: AMABADY_DUPLICATE_REVIEW_REPORT.md");
    process.exit(0);
}

detect().catch(console.error);
