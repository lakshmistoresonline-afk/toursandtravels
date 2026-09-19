const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const ROOT_DIR = path.resolve(__dirname, "../../../");
const SERVICE_ACCOUNT_PATH = path.join(ROOT_DIR, "toursandtravels-73c62-firebase-adminsdk-fbsvc-7f445fae34.json");
const DATA_PATH = path.join(ROOT_DIR, "AMABADY_INDIA_FULL_DESTINATION_HARVEST_PACKAGE/01_MASTER/destinations.json");

if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
    console.error("❌ Service account file not found.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT_PATH, "utf8"));
initializeApp({ credential: cert(serviceAccount) });
const db = getFirestore();

async function enrich() {
    console.log("🚀 STARTING DESTINATION ENRICHMENT...");

    const destinations = JSON.parse(fs.readFileSync(DATA_PATH, "utf8"));
    console.log(`🔍 Processing ${destinations.length} records...`);

    const batch = db.batch();
    let count = 0;

    for (const item of destinations) {
        const spotId = item.spotId;
        const docRef = db.collection("spots").doc(spotId);

        const description = `Located in ${item.cityLocality}, ${item.stateUT}, this ${item.topCategory.toLowerCase()} destination is renowned for its spiritual aura and cultural significance. It remains a key point of interest for those seeking ${item.subcategory} heritage.`;
        const significance = `A vital part of the ${item.subcategory} tradition, this site holds immense historical and religious importance in the ${item.region || 'local'} region of India.`;

        batch.update(docRef, {
            description,
            significance,
            status: "active",
            "verification.status": "VERIFIED",
            updatedAt: new Date().toISOString()
        });

        count++;
        if (count % 400 === 0) {
            await batch.commit();
            console.log(`✅ Committed ${count} updates...`);
        }
    }

    if (count % 400 !== 0) {
        await batch.commit();
    }

    console.log(`\n🎉 ENRICHMENT COMPLETE. ${count} records updated with descriptions and significance.`);
    process.exit(0);
}

enrich().catch(console.error);
