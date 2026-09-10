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
    { email: "admin@amady.com", password: "Password123", role: "admin", firstName: "AMADY", lastName: "Admin" },
    { email: "user1@example.com", password: "Password123", role: "user", firstName: "John", lastName: "Doe" },
    { email: "user2@example.com", password: "Password123", role: "user", firstName: "Jane", lastName: "Smith" },
    { email: "user3@example.com", password: "Password123", role: "user", firstName: "Alice", lastName: "Brown" },
    { email: "user4@example.com", password: "Password123", role: "user", firstName: "Bob", lastName: "White" },
    { email: "user5@example.com", password: "Password123", role: "user", firstName: "Charlie", lastName: "Green" },
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
    const otherCollections = ["users", "registrations"];
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
                role: u.role,
                status: "active",
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
