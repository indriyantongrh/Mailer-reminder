const admin = require("firebase-admin");

// Init Firebase
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: "kasirlaundryapps",
});

const db = admin.firestore();

async function main() {
    // Set accessUntil to tomorrow (H-1) in WIB
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // 10:00 WIB = 03:00 UTC

    console.log("📝 Adding test user to Firestore...");
    console.log(`   Email: masyantonugroho@gmail.com`);
    console.log(`   accessUntil: ${tomorrow.toISOString()}`);

    await db.collection("users").doc("test-reminder-user").set({
        name: "Test User",
        email: "masyantonugroho@gmail.com",
        accessUntil: admin.firestore.Timestamp.fromDate(tomorrow),
    });

    console.log("✅ Test user added successfully!");
    console.log("   Now run the subscription-reminder workflow to send the email.");
}

main().catch((err) => {
    console.error("❌ Error:", err.message);
    process.exit(1);
});
