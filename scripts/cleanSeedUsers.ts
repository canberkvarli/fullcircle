import * as admin from "firebase-admin";
import * as path from "path";
import * as fs from "fs";

// Function to find the Firebase service account key file
function findFirebaseKeyFile(): string | null {
  const filePath = path.resolve(__dirname, "../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-b1704d7015.json");

  console.log("🔍 Searching for Firebase service account key file...");
  
    if (fs.existsSync(filePath)) {
      console.log(`   ✅ Found at: ${filePath}`);
      return filePath;
    }
  
  console.log("❌ Firebase service account key file not found");
  return null;
}

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    // First try to find the service account key file
    const keyFilePath = findFirebaseKeyFile();
    
    if (keyFilePath) {
      admin.initializeApp({
        credential: admin.credential.cert(require(keyFilePath)),
        databaseURL: "https://fullcircle-3d01a-default-rtdb.firebaseio.com/",
      });
      console.log("✅ Firebase Admin SDK initialized successfully with service account key");
    } else {
      console.error("❌ Could not find Firebase service account key file");
      console.log("Expected file: ../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-b1704d7015.json");
      process.exit(1);
    }
  } catch (error) {
    console.error("❌ Failed to initialize Firebase Admin SDK:", error);
    process.exit(1);
  }
}

const db = admin.firestore();

/**
 * Recursively deletes a document and all of its subcollections.
 */
async function deleteDocumentAndSubcollections(
  docRef: admin.firestore.DocumentReference
) {
  try {
    // 1) List all subcollections under this document
    const subcols = await docRef.listCollections();
    // 2) For each subcollection, delete every document (and its subcollections) recursively
    for (const subcol of subcols) {
      const subSnap = await subcol.get();
      for (const subDoc of subSnap.docs) {
        await deleteDocumentAndSubcollections(subDoc.ref);
      }
    }
    // 3) Finally delete the document itself
    await docRef.delete();
  } catch (error) {
    console.error(`Error deleting document ${docRef.id}:`, error);
    throw error;
  }
}

async function cleanSeededUsers() {
  try {
    console.log("Starting cleanup of seeded users...");
    
    const usersCollection = db.collection("users");
    // 1) Find all users where isSeedUser == true
    const seededUsersSnapshot = await usersCollection
      .where("isSeedUser", "==", true)
      .get();

    if (seededUsersSnapshot.empty) {
      console.log("No seeded users found to delete.");
      return;
    }

    console.log(`Found ${seededUsersSnapshot.size} seeded users. Deleting...`);

    // 2) For each seeded user, recursively delete their subcollections and then the user doc
    for (const userDoc of seededUsersSnapshot.docs) {
      console.log(`→ Cleaning up user ${userDoc.id}...`);
      try {
        await deleteDocumentAndSubcollections(userDoc.ref);
        console.log(`✔ Deleted user ${userDoc.id} and all subcollection docs.`);
      } catch (error) {
        console.error(`✗ Failed to delete user ${userDoc.id}:`, error);
        // Continue with other users instead of failing completely
      }
    }

    console.log(
      "✅ All seeded users and their subcollections have been removed."
    );
  } catch (error: any) {
    console.error("Error cleaning seeded users:", error);
    
    // Check if it's an authentication error
    if (error.code === 2 || error.message.includes('Getting metadata from plugin failed')) {
      console.error("\n🔧 This appears to be an authentication error. Try these solutions:");
      console.error("1. Check your Firebase service account key file");
      console.error("2. Verify your environment variables in .env file");
      console.error("3. Make sure your private key doesn't have extra quotes or escape characters");
      console.error("4. Try regenerating your service account key from Firebase Console");
    }
    
    throw error;
  }
}

cleanSeededUsers().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});