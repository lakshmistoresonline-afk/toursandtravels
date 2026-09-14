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
        aadhar: "111122223333",
        gender: "Other",
        dob: "1980-01-01"
    },
    {
        email: "test1@ambady.com",
        password: "Password123",
        role: "user",
        firstName: "Test",
        lastName: "One",
        phone: "9000000001",
        aadhar: "100000000001",
        gender: "Male",
        dob: "1990-01-01"
    },
    {
        email: "test2@ambady.com",
        password: "Password123",
        role: "user",
        firstName: "Test",
        lastName: "Two",
        phone: "9000000002",
        aadhar: "100000000002",
        gender: "Female",
        dob: "1992-02-02"
    },
    {
        email: "test3@ambady.com",
        password: "Password123",
        role: "user",
        firstName: "Test",
        lastName: "Three",
        phone: "9000000003",
        aadhar: "100000000003",
        gender: "Other",
        dob: "1995-03-03"
    },
];

const sampleTours = [
    {
        tour_code: "VARANASI-2026",
        name: "Sacred Varanasi Pilgrimage",
        overview: "Experience the spiritual heart of India with our guided tour of the holy city of Varanasi. Witness the Ganga Aarti and explore ancient temples.",
        destination: "Varanasi, Uttar Pradesh",
        price: 15000,
        max_participants: 30,
        status: "REGISTRATION_OPEN",
        start_date: "2026-03-10",
        start_time: "06:00",
        end_date: "2026-03-15",
        end_time: "20:00",
        cover_image: "https://images.unsplash.com/photo-1561361058-c24cecae35ca?q=80&w=2070&auto=format&fit=crop",
        qr_code_url: "/payment-qr.png",
        itinerary: [
            { day_number: 1, title: "Arrival & Evening Aarti", description: "Arrival at Varanasi airport, check-in to hotel, and witness the spectacular Ganga Aarti." },
            { day_number: 2, title: "Temple Tour", description: "Visit the Kashi Vishwanath temple and other significant religious sites." }
        ]
    },
    {
        tour_code: "KEDARNATH-2026",
        name: "Kedarnath Yatra 2026",
        overview: "A divine trek to the Kedarnath temple, one of the Chardhams, nestled in the majestic Himalayas.",
        destination: "Kedarnath, Uttarakhand",
        price: 25000,
        max_participants: 20,
        status: "REGISTRATION_OPEN",
        start_date: "2026-05-20",
        start_time: "05:00",
        end_date: "2026-05-27",
        end_time: "18:00",
        cover_image: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1974&auto=format&fit=crop",
        qr_code_url: "/payment-qr.png",
        itinerary: [
            { day_number: 1, title: "Haridwar Arrival", description: "Meet and greet at Haridwar and proceed to Rishikesh." },
            { day_number: 2, title: "Drive to Sonprayag", description: "A scenic drive through the mountains to the base camp." }
        ]
    },
    {
        tour_code: "AMRITSAR-2026",
        name: "Golden Temple Spiritual Journey",
        overview: "Visit the serene Golden Temple in Amritsar and experience the peaceful atmosphere and community service.",
        destination: "Amritsar, Punjab",
        price: 12000,
        max_participants: 25,
        status: "PUBLISHED",
        start_date: "2026-04-15",
        start_time: "08:00",
        end_date: "2026-04-17",
        end_time: "22:00",
        cover_image: "https://images.unsplash.com/photo-1514222134-b57cbb8ce073?q=80&w=2022&auto=format&fit=crop",
        qr_code_url: "/payment-qr.png",
        itinerary: [
            { day_number: 1, title: "Golden Temple Visit", description: "Morning visit to Sri Harmandir Sahib and Langar participation." }
        ]
    }
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
                gender: u.gender || "Other",
                date_of_birth: u.dob || "1990-01-01",
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

    console.log("\n🚀 Re-populating with Sample Tours...");
    for (const t of sampleTours) {
        try {
            const tourRef = db.collection("tours").doc();
            await tourRef.set({
                ...t,
                currentParticipants: 0,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            console.log(`✅ Created Tour: ${t.name} (${t.tour_code})`);
        } catch (error) {
            console.error(`❌ Error creating tour ${t.name}:`, error.message);
        }
    }

    console.log("\n✨ DATABASE RESET & BOOTSTRAP COMPLETE!");
    process.exit(0);
}

reset().catch(err => {
    console.error("💥 Fatal Error:", err);
    process.exit(1);
});
