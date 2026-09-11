const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");

const serviceAccountPath = path.resolve(__dirname, "../../../toursandtravels-73c62-firebase-adminsdk-fbsvc-7f445fae34.json");

if (!fs.existsSync(serviceAccountPath)) {
    console.error("❌ Service account file not found at:", serviceAccountPath);
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, 'utf8'));

initializeApp({
  credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

const testUsers = [
    {
        email: "admin@ambady.com",
        password: "Password123",
        role: "admin",
        firstName: "AMBADY",
        lastName: "Admin",
        phone: "9999988888",
        aadhar: "111122223333"
    },
    {
        email: "john.doe@example.com",
        password: "Password123",
        role: "user",
        firstName: "John",
        lastName: "Doe",
        phone: "9876543210",
        aadhar: "123456789012"
    },
    {
        email: "jane.smith@example.com",
        password: "Password123",
        role: "user",
        firstName: "Jane",
        lastName: "Smith",
        phone: "9876543211",
        aadhar: "223344556677"
    },
    {
        email: "alice.v@example.com",
        password: "Password123",
        role: "user",
        firstName: "Alice",
        lastName: "V",
        phone: "9876543212",
        aadhar: "334455667788"
    },
];

async function deleteCollection(collectionPath, batchSize = 100) {
    const collectionRef = db.collection(collectionPath);
    const query = collectionRef.limit(batchSize);

    return new Promise((resolve, reject) => {
        deleteQueryBatch(query, resolve).catch(reject);
    });
}

async function deleteQueryBatch(query, resolve) {
    const snapshot = await query.get();

    const batchSize = snapshot.size;
    if (batchSize === 0) {
        resolve();
        return;
    }

    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
    });
    await batch.commit();

    process.nextTick(() => {
        deleteQueryBatch(query, resolve);
    });
}

async function reset() {
    console.log("🔥 FULL DATABASE RESET INITIATED...");

    // 1. Delete Tours and their Subcollections
    console.log("🗑️ Deleting collection: tours and subcollections...");
    const toursSnap = await db.collection("tours").get();
    for (const doc of toursSnap.docs) {
        // Delete itineraries subcollection first
        const itinerariesSnap = await doc.ref.collection("itineraries").get();
        const batch = db.batch();
        itinerariesSnap.docs.forEach(iDoc => batch.delete(iDoc.ref));
        await batch.commit();

        // Delete the tour document itself
        await doc.ref.delete();
    }

    // 2. Delete other top-level collections
    const otherCollections = ["users", "registrations", "notificationCampaigns"];
    for (const col of otherCollections) {
        console.log(`🗑️ Deleting collection: ${col}...`);
        await deleteCollection(col);
    }

    console.log("🗑️ Deleting all Auth users...");
    const listUsers = await auth.listUsers();
    const deletePromises = listUsers.users.map(user => auth.deleteUser(user.uid));
    await Promise.all(deletePromises);
    console.log(`✅ Deleted ${listUsers.users.length} Auth users.`);

    console.log("\n🚀 Re-populating with Test Users...");
    for (const u of testUsers) {
        try {
            const userRecord = await auth.createUser({
                email: u.email,
                password: u.password,
                displayName: `${u.firstName} ${u.lastName}`,
            });

            await db.collection("users").doc(userRecord.uid).set({
                uid: userRecord.uid,
                email: u.email,
                first_name: u.firstName,
                last_name: u.lastName,
                phone_number: u.phone || null,
                role: u.role,
                status: "active",
                whatsapp_number: u.phone || null,
                gender: "other",
                date_of_birth: "1990-01-01",
                address_house: "Sacred Residency 108",
                address_street: "Temple Road",
                address_locality: "Thiruvambady",
                address_district: "Thrissur",
                address_state: "Kerala",
                address_pin_code: "680001",
                country: "India",
                emergency_contact_name: "Guardian",
                emergency_contact_number: "9876543210",
                aadhar_number: u.aadhar || "000000000000",
                avatar_url: null,
                notifications: {
                    journeyAnnouncements: true,
                    registrationUpdates: true,
                    journeyChanges: true
                },
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            console.log(`✅ Created: ${u.email} (${u.role})`);
        } catch (error) {
            console.error(`❌ Error creating ${u.email}:`, error.message);
        }
    }

    console.log("\n✨ DATABASE RESET & BOOTSTRAP COMPLETE!");
    process.exit(0);
}

reset().catch(err => {
    console.error("💥 Fatal Error:", err);
    process.exit(1);
});
