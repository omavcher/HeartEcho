const admin = require("firebase-admin");
const path = require("path");

// Try to initialize using Environment Variables (Best for Production)
const firebaseConfig = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n') : undefined,
};

if (firebaseConfig.projectId && firebaseConfig.clientEmail && firebaseConfig.privateKey) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert(firebaseConfig)
    });
    console.log("Firebase Admin initialized via Environment Variables");
  } catch (error) {
    console.error("Firebase Admin Environment Variables initialization failed:", error.message);
  }
} else {
  // Fallback to Service Account JSON file (Good for Local Development)
  const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
  try {
    const serviceAccount = require(serviceAccountPath);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
    console.log("Firebase Admin initialized via JSON file");
  } catch (error) {
    console.warn("Firebase Admin: No credentials found (ENV or JSON). Push notifications will not work.");
  }
}

module.exports = admin;
