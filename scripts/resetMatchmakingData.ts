import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK - using the EXACT same setup as your working scripts
admin.initializeApp({
  credential: admin.credential.cert(
    require("../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-b1704d7015.json")
  ),
  databaseURL: "https://fullcircle-3d01a-default-rtdb.firebaseio.com/",
});

const db = admin.firestore();

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
      lastLikeResetDate: admin.firestore.FieldValue.delete()
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
  console.log("🚀 Starting reset for ALL users...");
  
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
  // Reset specific user: npm run reset-matchmaking user USER_ID
  resetSpecificUser(userId).catch(err => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
} else if (command === "all") {
  // Reset all users: npm run reset-matchmaking all
  resetAllUsers().catch(err => {
    console.error("Unexpected error:", err);
    process.exit(1);
  });
} else {
  console.log("Usage:");
  console.log("  Reset specific user: npx ts-node scripts/resetMatchmakingSimple.ts user USER_ID");
  console.log("  Reset all users: npx ts-node scripts/resetMatchmakingSimple.ts all");
  console.log("");
  console.log("Examples:");
  console.log("  npx ts-node scripts/resetMatchmakingSimple.ts user uveAC1yljUPMlNpoAmHhV5g4BUF2");
  console.log("  npx ts-node scripts/resetMatchmakingSimple.ts all");
}