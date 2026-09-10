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

async function bootstrap() {
    console.log("🚀 Starting Firebase Bootstrap...");

    for (const u of testUsers) {
        try {
            console.log(`Processing: ${u.email}...`);
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(u.email);
                console.log(`  User exists (UID: ${userRecord.uid})`);
            } catch (e) {
                userRecord = await auth.createUser({
                    email: u.email,
                    password: u.password,
                    displayName: `${u.firstName} ${u.lastName}`,
                });
                console.log(`  Created Auth user (UID: ${userRecord.uid})`);
            }

            const userRef = db.collection("users").doc(userRecord.uid);
            await userRef.set({
                uid: userRecord.uid,
                email: u.email,
                first_name: u.firstName,
                last_name: u.lastName,
                role: u.role,
                status: "active",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            }, { merge: true });

            console.log(`  ✅ Firestore profile synced.`);
        } catch (error) {
            console.error(`  ❌ Error processing ${u.email}:`, error.message);
        }
    }

    console.log("\n🎉 Bootstrap complete!");
    process.exit(0);
}

bootstrap();
