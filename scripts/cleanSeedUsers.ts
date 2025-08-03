import * as path from "path";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Firebase Admin SDK
let app: admin.app.App;

try {
  // Option 1: Try service account key file first (recommended)
  const getKeyFilePath = () => {
    const env = process.env.EXPO_PUBLIC_ENV || 'development';
    switch (env) {
      case 'production':
        return path.resolve(__dirname, "../server/keys/fullcircle-prod-firebase-adminsdk.json");
      case 'staging':
        return path.resolve(__dirname, "../server/keys/fullcircle-staging-firebase-adminsdk.json");
      default:
        return path.resolve(__dirname, "../server/keys/fullcircle-dev-firebase-adminsdk.json");
    }
  };

  const keyFilePath = getKeyFilePath();
  
  if (require('fs').existsSync(keyFilePath)) {
    const serviceAccount = require(keyFilePath);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
    console.log(`✅ Firebase initialized with service account key file: ${serviceAccount.project_id}`);
  } else {
    // Option 2: Fall back to environment variables
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      // Clean up the private key - remove quotes and ensure proper line breaks
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Remove surrounding quotes if they exist
      privateKey = privateKey.replace(/^["']|["']$/g, '');
      
      // Replace \\n with actual newlines
      privateKey = privateKey.replace(/\\n/g, '\n');
      
      // Ensure it starts and ends correctly
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
        throw new Error("Invalid private key format");
      }

      const projectId = process.env.FIREBASE_PROJECT_ID;
      
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        storageBucket: `${projectId}.appspot.com`,
      });
      
      console.log(`✅ Firebase initialized with environment variables: ${projectId}`);
    } else {
      throw new Error("Missing Firebase credentials");
    }
  }
} catch (error) {
  console.error("❌ Could not initialize Firebase. Please ensure you have:");
  console.error("1. Service account key file in server/keys/ folder");
  console.error("2. OR environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL");
  console.error("\nError details:", error);
  process.exit(1);
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
    console.log(`🧹 Starting cleanup of seeded users from ${process.env.FIREBASE_PROJECT_ID}...`);
    
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

    // Also clean up related data
    console.log("🧹 Cleaning up related data...");
    
    // Delete chats involving seeded users
    const chatsSnapshot = await db.collection("chats").get();
    let deletedChats = 0;
    
    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();
      if (chatData.participants && Array.isArray(chatData.participants)) {
        // Check if any participant was a seeded user
        const hasSeededUser = await Promise.all(
          chatData.participants.map(async (userId: string) => {
            try {
              const userDoc = await db.collection("users").doc(userId).get();
              return !userDoc.exists; // If user doesn't exist, it was probably seeded
            } catch {
              return true; // If we can't check, assume it was seeded
            }
          })
        );
        
        if (hasSeededUser.some(Boolean)) {
          await chatDoc.ref.delete();
          deletedChats++;
        }
      }
    }
    
    if (deletedChats > 0) {
      console.log(`✔ Deleted ${deletedChats} chat documents`);
    }

    console.log(
      "✅ All seeded users and their related data have been removed."
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

// Run the cleanup function
cleanSeededUsers().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});