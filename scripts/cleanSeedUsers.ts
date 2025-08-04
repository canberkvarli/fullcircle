import * as path from "path";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import * as fs from "fs";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Firebase Admin SDK with better error handling
let app: admin.app.App;

async function initializeFirebase() {
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
          // Try the specific filename first, then fall back to generic name
          const specificPath = path.resolve(__dirname, "../server/keys");
          if (fs.existsSync(specificPath)) {
            const files = fs.readdirSync(specificPath).filter(f => f.includes('fullcircle-dev') && f.endsWith('.json'));
            if (files.length > 0) {
              return path.resolve(specificPath, files[0]);
            }
          }
          return path.resolve(__dirname, "../server/keys/fullcircle-dev-firebase-adminsdk.json");
      }
    };

    const keyFilePath = getKeyFilePath();
    
    // Check if file exists and is readable
    if (fs.existsSync(keyFilePath)) {
      console.log(`📁 Found key file at: ${keyFilePath}`);
      
      try {
        // Read and validate the service account file
        const fileContent = fs.readFileSync(keyFilePath, 'utf8');
        const serviceAccount = JSON.parse(fileContent);
        
        // Validate required fields
        if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
          throw new Error("Service account file is missing required fields");
        }
        
        console.log(`🔑 Service account validation passed for project: ${serviceAccount.project_id}`);
        
        app = admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: `${serviceAccount.project_id}.appspot.com`,
        });
        
        console.log(`✅ Firebase initialized with service account key file: ${serviceAccount.project_id}`);
        return;
      } catch (fileError) {
        if (fileError instanceof Error) {
          console.error(`❌ Error reading/parsing service account file: ${fileError.message}`);
        } else {
          console.error(`❌ Error reading/parsing service account file:`, fileError);
        }
        throw fileError;
      }
    }
    // Option 2: Fall back to environment variables
    console.log("🔄 Service account file not found, trying environment variables...");
    
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY && process.env.FIREBASE_CLIENT_EMAIL) {
      let privateKey = process.env.FIREBASE_PRIVATE_KEY;
      
      // Clean up the private key
      privateKey = privateKey.replace(/^["']|["']$/g, ''); // Remove quotes
      privateKey = privateKey.replace(/\\n/g, '\n'); // Replace escaped newlines
      
      // Validate private key format
      if (!privateKey.includes('-----BEGIN PRIVATE KEY-----') || !privateKey.includes('-----END PRIVATE KEY-----')) {
        throw new Error("Environment variable FIREBASE_PRIVATE_KEY has invalid format");
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
      return;
    }
    
    throw new Error("No valid Firebase credentials found");
    
  } catch (error) {
    console.error("\n❌ Firebase initialization failed!");
    console.error("🔧 Troubleshooting steps:");
    console.error("1. Download a fresh service account key from Firebase Console");
    console.error("2. Ensure the key file is in the correct location:");
    console.error(`   ${path.resolve(__dirname, "../server/keys/")}`);
    console.error("3. OR set these environment variables:");
    console.error("   - FIREBASE_PROJECT_ID");
    console.error("   - FIREBASE_PRIVATE_KEY (with proper \\n escaping)");
    console.error("   - FIREBASE_CLIENT_EMAIL");
    console.error(`\n💡 Current environment: ${process.env.EXPO_PUBLIC_ENV || 'development'}`);
    if (error instanceof Error) {
      console.error("\nError details:", error.message);
    } else {
      console.error("\nError details:", error);
    }
    process.exit(1);
  }
}

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
    // Initialize Firebase first
    await initializeFirebase();
    
    const db = admin.firestore();
    
    console.log(`🧹 Starting cleanup of seeded users...`);
    
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
cleanSeededUsers()
  .then(() => {
    console.log("🎉 Cleanup completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Cleanup failed:", err);
    process.exit(1);
  });