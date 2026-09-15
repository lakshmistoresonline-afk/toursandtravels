const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const fs = require("fs");
const path = require("path");
const { parse } = require("querystring"); // We'll use a simple logic or require a csv-parser if available

// CONFIGURATION
const CSV_FILE = "registrations.csv";
const SERVICE_ACCOUNT = path.resolve(__dirname, "../../../toursandtravels-73c62-firebase-adminsdk-fbsvc-7f445fae34.json");
const DEFAULT_PASSWORD = "Sacred@123";

if (!fs.existsSync(SERVICE_ACCOUNT)) {
    console.error("❌ Service account file not found.");
    process.exit(1);
}

if (!fs.existsSync(CSV_FILE)) {
    console.error(`❌ CSV file not found. Please download your Google Sheet as '${CSV_FILE}' and place it in the root folder.`);
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

async function importData() {
    console.log("🚀 STARTING PILGRIM IMPORT...");

    const content = fs.readFileSync(CSV_FILE, 'utf8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);

    // Skip header row
    const dataRows = lines.slice(1);
    let successCount = 0;
    let failCount = 0;

    for (const row of dataRows) {
        // Simple CSV split (note: doesn't handle commas inside quotes, but fine for basic fields)
        const columns = row.split(',').map(c => c.trim().replace(/^"|"$/g, ''));

        // Expected Order: Timestamp, First Name, Last Name, Email, Phone, Aadhar, Gender, DOB
        // Note: Google Forms usually adds a Timestamp as the first column.
        const [timestamp, firstName, lastName, email, phone, aadhar, gender, dob] = columns;

        if (!email || !firstName) continue;

        try {
            console.log(`\n📄 Processing: ${email}...`);

            // 1. Check if user already exists in Auth
            let userRecord;
            try {
                userRecord = await auth.getUserByEmail(email);
                console.log(`   - User already exists in Auth. Skipping creation.`);
            } catch (e) {
                // Create user if not exists
                userRecord = await auth.createUser({
                    email,
                    password: DEFAULT_PASSWORD,
                    displayName: `${firstName} ${lastName}`,
                });
                console.log(`   - Created Auth account with default password.`);
            }

            // 2. Create or Update Firestore Profile
            await db.collection("users").doc(userRecord.uid).set({
                uid: userRecord.uid,
                email,
                first_name: firstName,
                last_name: lastName,
                phone_number: phone,
                whatsapp_number: phone,
                gender: gender || "Other",
                date_of_birth: dob || null,
                aadhar_number: aadhar || null,
                role: "user",
                status: "active",
                address_house: "Imported via Google Form",
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                notifications: {
                    journeyAnnouncements: true,
                    registrationUpdates: true,
                    journeyChanges: true
                }
            }, { merge: true });

            console.log(`   ✅ Successfully imported.`);
            successCount++;
        } catch (err) {
            console.error(`   ❌ Failed: ${err.message}`);
            failCount++;
        }
    }

    console.log("\n--- IMPORT SUMMARY ---");
    console.log(`✅ Success: ${successCount}`);
    console.log(`❌ Failed: ${failCount}`);
    console.log("----------------------");
    process.exit(0);
}

importData();
