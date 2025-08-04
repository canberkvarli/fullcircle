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

async function resetSpecificUser(userId: string) {
  console.log(`🔄 Resetting user ${userId}...`);
  
  try {
    // Initialize Firebase first
    await initializeFirebase();
    
    const db = admin.firestore();
    const FieldValue = admin.firestore.FieldValue;
    
    const userRef = db.collection("users").doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      console.log(`❌ User ${userId} not found`);
      return;
    }
    
    // 1. Reset counters in main user document
    console.log(`   📊 Resetting counters...`);
    await userRef.update({
      likesGivenCount: 0,
      likesReceivedCount: 0,
      dislikesGivenCount: 0,
      dislikesReceivedCount: 0,
      matches: [],
      dailyLikesCount: 0,
      lastLikeResetDate: FieldValue.delete()
    });
    
    // 2. Delete subcollections
    const subcollections = ['likesGiven', 'likesReceived', 'matches', 'dislikesGiven'];
    
    for (const subcollectionName of subcollections) {
      console.log(`   🗑️  Deleting ${subcollectionName} subcollection...`);
      const subcollectionRef = userRef.collection(subcollectionName);
      const snapshot = await subcollectionRef.get();
      
      if (!snapshot.empty) {
        const batch = db.batch();
        snapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        console.log(`   ✅ Deleted ${snapshot.size} documents from ${subcollectionName}`);
      } else {
        console.log(`   📁 No documents in ${subcollectionName}`);
      }
    }
    
    // 3. Delete chats involving this user
    console.log(`   💬 Deleting chats...`);
    const chatsQuery = db.collection("chats").where("participants", "array-contains", userId);
    const chatsSnapshot = await chatsQuery.get();
    
    if (!chatsSnapshot.empty) {
      const chatBatch = db.batch();
      chatsSnapshot.docs.forEach(doc => {
        chatBatch.delete(doc.ref);
      });
      await chatBatch.commit();
      console.log(`   ✅ Deleted ${chatsSnapshot.size} chat documents`);
    } else {
      console.log(`   📁 No chats found`);
    }
    
    console.log(`✅ Successfully reset user ${userId}`);
    
  } catch (error) {
    console.error(`❌ Error resetting user ${userId}:`, error);
  }
}

async function resetAllUsers() {
  console.log(`🚀 Starting reset for ALL users...`);
  
  try {
    // Initialize Firebase first
    await initializeFirebase();
    
    const db = admin.firestore();
    
    const usersSnapshot = await db.collection("users").get();
    console.log(`📊 Found ${usersSnapshot.size} users to reset`);
    
    let count = 0;
    for (const userDoc of usersSnapshot.docs) {
      count++;
      console.log(`\n[${count}/${usersSnapshot.size}] Processing user ${userDoc.id}...`);
      
      try {
        const FieldValue = admin.firestore.FieldValue;
        
        // Reset counters in main user document
        await userDoc.ref.update({
          likesGivenCount: 0,
          likesReceivedCount: 0,
          dislikesGivenCount: 0,
          dislikesReceivedCount: 0,
          matches: [],
          dailyLikesCount: 0,
          lastLikeResetDate: FieldValue.delete()
        });
        
        // Delete subcollections
        const subcollections = ['likesGiven', 'likesReceived', 'matches', 'dislikesGiven'];
        
        for (const subcollectionName of subcollections) {
          const subcollectionRef = userDoc.ref.collection(subcollectionName);
          const snapshot = await subcollectionRef.get();
          
          if (!snapshot.empty) {
            const batch = db.batch();
            snapshot.docs.forEach(doc => {
              batch.delete(doc.ref);
            });
            await batch.commit();
          }
        }
        
        console.log(`   ✅ Reset user ${userDoc.id}`);
        
      } catch (userError) {
        console.error(`   ❌ Failed to reset user ${userDoc.id}:`, userError);
      }
    }
    
    // Delete all chats
    console.log(`\n💬 Deleting all chat documents...`);
    const chatsSnapshot = await db.collection("chats").get();
    
    if (!chatsSnapshot.empty) {
      const chatBatch = db.batch();
      chatsSnapshot.docs.forEach(doc => {
        chatBatch.delete(doc.ref);
      });
      await chatBatch.commit();
      console.log(`✅ Deleted ${chatsSnapshot.size} chat documents`);
    }
    
    console.log(`\n🎉 Successfully reset ${count} users!`);
    
  } catch (error) {
    console.error("❌ Error resetting users:", error);
  }
}

// Get command line arguments
const args = process.argv.slice(2);
const command = args[0];
const userId = args[1];

if (command === "user" && userId) {
  // Reset specific user: npx ts-node scripts/resetMatchmaking.ts user USER_ID
  resetSpecificUser(userId)
    .then(() => {
      console.log("🎉 User reset completed successfully!");
      process.exit(0);
    })
    .catch(err => {
      console.error("❌ User reset failed:", err);
      process.exit(1);
    });
} else if (command === "all") {
  // Reset all users: npx ts-node scripts/resetMatchmaking.ts all
  resetAllUsers()
    .then(() => {
      console.log("🎉 All users reset completed successfully!");
      process.exit(0);
    })
    .catch(err => {
      console.error("❌ All users reset failed:", err);
      process.exit(1);
    });
} else {
  console.log("Usage:");
  console.log("  Reset specific user: npx ts-node scripts/resetMatchmaking.ts user USER_ID");
  console.log("  Reset all users: npx ts-node scripts/resetMatchmaking.ts all");
  console.log("");
  console.log("Examples:");
  console.log("  npx ts-node scripts/resetMatchmaking.ts user uveAC1yljUPMlNpoAmHhV5g4BUF2");
  console.log("  npx ts-node scripts/resetMatchmaking.ts all");
}