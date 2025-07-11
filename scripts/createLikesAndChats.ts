import * as path from "path";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Firebase Admin SDK - Multiple options for flexibility
let app: admin.app.App;

try {
  // Option 1: Try service account key file
  const serviceAccountPath = path.resolve(__dirname, "../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json");
  app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccountPath),
    storageBucket: "fullcircle-3d01a.appspot.com",
  });
  console.log("✅ Firebase initialized with service account key file");
} catch (error) {
  try {
    // Option 2: Try with environment variables (with better private key handling)
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

      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        storageBucket: "fullcircle-3d01a.appspot.com",
      });
      console.log("✅ Firebase initialized with environment variables");
    } else {
      throw new Error("Firebase credentials not found");
    }
  } catch (envError) {
    console.error("❌ Could not initialize Firebase. Please ensure you have:");
    console.error("1. Service account key file at: ../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json");
    console.error("2. OR environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL");
    console.error("\nError details:", envError);
    process.exit(1);
  }
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const CURRENT_USER_ID = process.argv[2];
if (!CURRENT_USER_ID) {
  console.error("Please provide a current user ID as the first argument.");
  console.error("Usage: npx ts-node scripts/simulateDummyLikesAndChats.ts <USER_ID>");
  process.exit(1);
}

async function simulateDummyLikesAndChats(): Promise<void> {
  console.log(`🔥 Starting dummy likes and chats simulation for user: ${CURRENT_USER_ID}`);
  
  const currentUserRef = db.collection("users").doc(CURRENT_USER_ID);
  const currentUserSnap = await currentUserRef.get();
  if (!currentUserSnap.exists) {
    console.error("❌ Current user document not found!");
    process.exit(1);
  }

  console.log("✅ Current user found, fetching other users...");

  // Fetch all other users (excluding seed users for more realistic data)
  const allUsersSnap = await db.collection("users")
    .where("isSeedUser", "==", true) // Only use seed users for testing
    .get();
    
  const others = allUsersSnap.docs
    .filter((doc) => doc.id !== CURRENT_USER_ID)
    .map((doc) => ({ 
      id: doc.id, 
      data: doc.data() 
    }));
    
  if (others.length < 10) {
    console.warn(`⚠️  Only found ${others.length} other users. You might want to run the seed script first.`);
  }
  
  faker.helpers.shuffle(others);

  // First 5 will just like current user, next 5 will be mutual matches
  const dummyLikes = others.slice(0, Math.min(5, others.length));
  const dummyMatches = others.slice(5, Math.min(10, others.length));

  console.log(`📝 Creating ${dummyLikes.length} incoming likes and ${dummyMatches.length} mutual matches...`);

  // --- Seed free likes (others -> current) ---
  console.log("1️⃣  Seeding incoming likes...");
  for (const { id: fromUserId } of dummyLikes) {
    const toUserId = CURRENT_USER_ID;

    // Increment counters
    await db
      .collection("users")
      .doc(fromUserId)
      .update({ likesGivenCount: FieldValue.increment(1) });
    await db
      .collection("users")
      .doc(toUserId)
      .update({ likesReceivedCount: FieldValue.increment(1) });

    // Write LikeRecords
    await db
      .collection("users")
      .doc(fromUserId)
      .collection("likesGiven")
      .doc(toUserId)
      .set({
        matchId: toUserId,
        viaOrb: faker.datatype.boolean(0.2), // 20% chance via orb
        timestamp: FieldValue.serverTimestamp(),
      });
    await db
      .collection("users")
      .doc(toUserId)
      .collection("likesReceived")
      .doc(fromUserId)
      .set({
        matchId: fromUserId,
        viaOrb: faker.datatype.boolean(0.2), // 20% chance via orb
        timestamp: FieldValue.serverTimestamp(),
      });
      
    console.log(`   ✨ ${fromUserId.slice(0, 8)} liked you`);
  }

  // --- Seed mutual matches (both directions) ---
  console.log("2️⃣  Seeding mutual matches...");
  for (const { id: otherId, data: otherUserData } of dummyMatches) {
    console.log(`   💕 Creating match with ${otherUserData?.firstName || otherId.slice(0, 8)}...`);
    
    // A -> B (they like you first)
    await db
      .collection("users")
      .doc(otherId)
      .update({ likesGivenCount: FieldValue.increment(1) });
    await currentUserRef.update({
      likesReceivedCount: FieldValue.increment(1),
    });
    await db
      .collection("users")
      .doc(otherId)
      .collection("likesGiven")
      .doc(CURRENT_USER_ID)
      .set({
        matchId: CURRENT_USER_ID,
        viaOrb: faker.datatype.boolean(0.1),
        timestamp: FieldValue.serverTimestamp(),
      });
    await currentUserRef.collection("likesReceived").doc(otherId).set({
      matchId: otherId,
      viaOrb: faker.datatype.boolean(0.1),
      timestamp: FieldValue.serverTimestamp(),
    });

    // B -> A (you like them back, creating a match)
    await currentUserRef.update({ likesGivenCount: FieldValue.increment(1) });
    await db
      .collection("users")
      .doc(otherId)
      .update({ likesReceivedCount: FieldValue.increment(1) });
    await currentUserRef.collection("likesGiven").doc(otherId).set({
      matchId: otherId,
      viaOrb: faker.datatype.boolean(0.1),
      timestamp: FieldValue.serverTimestamp(),
    });
    await db
      .collection("users")
      .doc(otherId)
      .collection("likesReceived")
      .doc(CURRENT_USER_ID)
      .set({
        matchId: CURRENT_USER_ID,
        viaOrb: faker.datatype.boolean(0.1),
        timestamp: FieldValue.serverTimestamp(),
      });

    // Remove the incoming like since it's now a match
    await currentUserRef.update({
      likesReceivedCount: FieldValue.increment(-1),
    });
    await currentUserRef.collection("likesReceived").doc(otherId).delete();

    // Update matches arrays 
    await db
      .collection("users")
      .doc(otherId)
      .update({ matches: FieldValue.arrayUnion(CURRENT_USER_ID) });
    await currentUserRef.update({ matches: FieldValue.arrayUnion(otherId) });

    // Create matches subcollection documents
    await db
      .collection("users")
      .doc(otherId)
      .collection("matches")
      .doc(CURRENT_USER_ID)
      .set({
        matchId: CURRENT_USER_ID,
        timestamp: FieldValue.serverTimestamp(),
      });

    await currentUserRef.collection("matches").doc(otherId).set({
      matchId: otherId,
      timestamp: FieldValue.serverTimestamp(),
    });
  }

  console.log("3️⃣  Seeding chat conversations...");

  // --- Seed chats for each mutual match ---
  for (const { id: otherId, data: otherUserData } of dummyMatches) {
    const chatId = [CURRENT_USER_ID, otherId].sort().join("_");
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();

    const now = new Date();
    
    // More realistic conversation starters
    const conversationStarters = [
      `Hey! I love your profile 😊`,
      `Hi there! How's your day going?`,
      `Hello! I noticed we both like ${faker.helpers.arrayElement(['meditation', 'yoga', 'hiking', 'traveling'])} 🌟`,
      `Hey! Your photos are beautiful ✨`,
      `Hi! I'd love to get to know you better`,
    ];
    
    const responses = [
      `Thank you! That's so sweet 💕`,
      `Hey! It's going great, thanks for asking!`,
      `Oh nice! I'm always looking for someone to ${faker.helpers.arrayElement(['practice with', 'explore with', 'share experiences with'])}`,
      `Thank you so much! You seem really interesting too`,
      `I'd love that! Tell me a bit about yourself`,
      `Likewise! What do you enjoy doing for fun?`,
    ];

    const conversation = [
      {
        text: faker.helpers.arrayElement(conversationStarters),
        sender: otherId, // They message first
        timestamp: admin.firestore.Timestamp.fromDate(now),
        senderId: otherId,
      },
      {
        text: faker.helpers.arrayElement(responses),
        sender: CURRENT_USER_ID, // You respond
        timestamp: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 300000)), // 5 min later
        senderId: CURRENT_USER_ID,
      },
    ];
    
    // Sometimes add a third message
    if (faker.datatype.boolean(0.7)) {
      const followUps = [
        `I'd love to grab coffee sometime! ☕`,
        `Want to chat more about our shared interests?`,
        `Would you be interested in meeting up?`,
        `I think we'd get along really well!`,
      ];
      
      conversation.push({
        text: faker.helpers.arrayElement(followUps),
        sender: otherId,
        timestamp: admin.firestore.Timestamp.fromDate(new Date(now.getTime() + 600000)), // 10 min later
        senderId: otherId,
      });
    }

    const lastMsg = conversation[conversation.length - 1];

    if (!chatSnap.exists) {
      await chatRef.set({
        participants: [CURRENT_USER_ID, otherId],
        messages: conversation,
        createdAt: FieldValue.serverTimestamp(),
        lastMessage: lastMsg.text,
        lastMessageSender: lastMsg.sender,
        lastUpdated: FieldValue.serverTimestamp(),
      });
    } else {
      await chatRef.update({
        messages: FieldValue.arrayUnion(...conversation),
        lastMessage: lastMsg.text,
        lastMessageSender: lastMsg.sender,
        lastUpdated: FieldValue.serverTimestamp(),
      });
    }
    
    console.log(`   💬 Chat created with ${otherUserData?.firstName || otherId.slice(0, 8)}`);
  }

  console.log("\n🎉 Dummy likes and chats seeded successfully!");
  console.log(`📊 Summary:`);
  console.log(`   • ${dummyLikes.length} incoming likes`);
  console.log(`   • ${dummyMatches.length} mutual matches`);
  console.log(`   • ${dummyMatches.length} chat conversations`);
}

simulateDummyLikesAndChats()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Script error:", err);
    process.exit(1);
  });