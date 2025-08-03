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
const FieldValue = admin.firestore.FieldValue;

async function resetSpecificUser(userId: string) {
  console.log(`🔄 Resetting user ${userId}...`);
  
  try {
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
  console.log(`🚀 Starting reset for ALL users in ${process.env.FIREBASE_PROJECT_ID}...`);
  
  try {
    const usersSnapshot = await db.collection("users").get();
    console.log(`📊 Found ${usersSnapshot.size} users to reset`);
    
    let count = 0;
    for (const userDoc of usersSnapshot.docs) {
      count++;
      console.log(`\n[${count}/${usersSnapshot.size}] Processing user ${userDoc.id}...`);
      await resetSpecificUser(userDoc.id);
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
  resetSpecificUser(userId).catch(err => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
} else if (command === "all") {
  // Reset all users: npx ts-node scripts/resetMatchmaking.ts all
  resetAllUsers().catch(err => {
    console.error("Unexpected error:", err);
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