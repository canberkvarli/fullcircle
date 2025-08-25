import * as path from "path";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import * as fs from "fs";
import { personalPractices } from "../constants/personalPractices";

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

// Get command line arguments
const CURRENT_USER_ID = process.argv[2];

if (!CURRENT_USER_ID) {
  console.error("Please provide a current user ID as the first argument.");
  console.error("Usage: npx ts-node scripts/simulateLikesAndChats.ts <USER_ID>");
  process.exit(1);
}

async function simulateDummyLikesAndChats(): Promise<void> {
  // Initialize Firebase first
  await initializeFirebase();
  
  const db = admin.firestore();
  const FieldValue = admin.firestore.FieldValue;
  
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
    
  if (others.length < 25) {
    console.warn(`⚠️  Only found ${others.length} other users. You might want to run the seed script first to create more users.`);
  }
  
  faker.helpers.shuffle(others);
  
  // First 20 will just like current user, next 5 will be mutual matches
  const dummyLikes = others.slice(0, Math.min(20, others.length));
  const dummyMatches = others.slice(20, Math.min(25, others.length));
  
  console.log(`📝 Creating ${dummyLikes.length} incoming likes and ${dummyMatches.length} mutual matches...`);

  // --- Seed incoming likes (others -> current) ---
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
      `Hello! I noticed we both like ${faker.helpers.arrayElement(personalPractices.map(p => p.name))} 🌟`,
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

// Run the simulation
simulateDummyLikesAndChats()
  .then(() => {
    console.log("\n✅ Script completed successfully!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Script error:", err);
    process.exit(1);
  });