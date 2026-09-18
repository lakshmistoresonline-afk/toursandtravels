const { initializeApp, cert } = require("firebase-admin/app");
const { getAuth } = require("firebase-admin/auth");
const { getFirestore } = require("firebase-admin/firestore");
const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');

// CONFIGURATION
const EXCEL_FILE = "C:\\Users\\ADMIN\\Downloads\\Untitled form (Responses).xlsx";
const SERVICE_ACCOUNT = path.resolve(__dirname, "../../../toursandtravels-73c62-firebase-adminsdk-fbsvc-7f445fae34.json");
const DEFAULT_PASSWORD = "Password123";

if (!fs.existsSync(SERVICE_ACCOUNT)) {
    console.error("❌ Service account file not found.");
    process.exit(1);
}

const serviceAccount = JSON.parse(fs.readFileSync(SERVICE_ACCOUNT, 'utf8'));
initializeApp({ credential: cert(serviceAccount) });

const auth = getAuth();
const db = getFirestore();

// Helper to convert Excel date to ISO string
function excelDateToISO(serial) {
    if (!serial || isNaN(serial)) return null;
    const utc_days = Math.floor(serial - 25569);
    const utc_value = utc_days * 86400;
    const date_info = new Date(utc_value * 1000);
    return date_info.toISOString().split('T')[0];
}

async function importData() {
    console.log("🚀 STARTING EXCEL IMPORT...");

    try {
        const workbook = XLSX.readFile(EXCEL_FILE);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { header: 1 });

        // Skip header row
        const dataRows = rows.slice(1);
        let successCount = 0;
        let failCount = 0;

        for (const columns of dataRows) {
            // Mapping based on analysis:
            // 0: Timestamp, 1: EmailAddress, 2: FirstName, 3: LastName, 4: EmailAddress 2, 5: PhoneNumber, 6: AadharNumber, 7: Gender, 8: DateofBirth
            const email = columns[1]?.toString().trim().toLowerCase();
            const firstName = columns[2]?.toString().trim();
            const lastName = columns[3]?.toString().trim();
            const phone = columns[5]?.toString().trim();
            const aadhar = columns[6]?.toString().trim();
            const gender = columns[7]?.toString().trim();
            const dob = excelDateToISO(columns[8]);

            if (!email || !firstName) {
                console.log(`⚠️ Skipping row with missing email or name: ${JSON.stringify(columns)}`);
                continue;
            }

            try {
                console.log(`\n📄 Processing: ${email}...`);

                // 1. Check/Create Auth Account
                let userRecord;
                try {
                    userRecord = await auth.getUserByEmail(email);
                    console.log(`   - User exists in Auth. Updating profile.`);
                } catch (e) {
                    userRecord = await auth.createUser({
                        email,
                        password: DEFAULT_PASSWORD,
                        displayName: `${firstName} ${lastName}`,
                    });
                    console.log(`   - Created Auth account with password: ${DEFAULT_PASSWORD}`);
                }

                // 2. Sync Firestore Profile
                await db.collection("users").doc(userRecord.uid).set({
                    uid: userRecord.uid,
                    email,
                    first_name: firstName,
                    last_name: lastName,
                    phone_number: phone || null,
                    whatsapp_number: phone || null,
                    gender: gender || "Other",
                    date_of_birth: dob || null,
                    aadhar_number: aadhar || null,
                    role: "user",
                    status: "active",
                    address_house: "Imported via Excel",
                    updatedAt: new Date().toISOString(),
                    notifications: {
                        journeyAnnouncements: true,
                        registrationUpdates: true,
                        journeyChanges: true
                    }
                }, { merge: true });

                // If this is a new user (not recently updated), add a createdAt
                const docSnap = await db.collection("users").doc(userRecord.uid).get();
                if (!docSnap.data()?.createdAt) {
                    await db.collection("users").doc(userRecord.uid).update({
                        createdAt: new Date().toISOString()
                    });
                }

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
    } catch (err) {
        console.error("❌ Error reading Excel file:", err.message);
    }
    process.exit(0);
}

importData();
