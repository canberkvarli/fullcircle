import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json")
  ),
  storageBucket: "fullcircle-3d01a.appspot.com",
});

const db = admin.firestore();

// Get the current user ID from command line arguments.
const CURRENT_USER_ID = process.argv[2];
if (!CURRENT_USER_ID) {
  console.error("Please provide a current user ID as the first argument.");
  process.exit(1);
}

/**
 * Simulate dummy likes and chat conversations.
 * - For 5 dummy users, simulate one-sided likes (the current user's likesReceived is updated)
 *   so these users will be considered "kindred spirits" (i.e. they liked the current user, but no match).
 * - For 5 dummy users, simulate mutual matches (update both users' likedMatches and matches arrays)
 *   and create a chat conversation with dummy messages.
 */
async function simulateDummyLikesAndChats(): Promise<void> {
  // --- STEP 1: Fetch the current user's document ---
  const currentUserRef = db.collection("users").doc(CURRENT_USER_ID);
  const currentUserSnap = await currentUserRef.get();
  if (!currentUserSnap.exists) {
    console.error("Current user document not found!");
    process.exit(1);
  }
  const currentUserData = currentUserSnap.data() as any;
  
  // Ensure the arrays exist (or initialize them)
  currentUserData.likedMatches = currentUserData.likedMatches || [];
  currentUserData.matches = currentUserData.matches || [];
  currentUserData.likesReceived = currentUserData.likesReceived || [];
  
  // --- STEP 2: Fetch dummy users (all users except the current user) ---
  const usersSnapshot = await db.collection("users").get();
  const dummyUsers: Array<{ id: string; data: any }> = [];
  usersSnapshot.forEach((doc) => {
    if (doc.id !== CURRENT_USER_ID) {
      dummyUsers.push({ id: doc.id, data: doc.data() });
    }
  });
  // Shuffle the dummy users and select 10
  dummyUsers.sort(() => Math.random() - 0.5);
  const selectedDummyUsers = dummyUsers.slice(0, 10);

  // Divide dummy users: first half for one-sided likes (kindred spirits)
  // and second half for mutual matches.
  const dummyLikes = selectedDummyUsers.slice(0, 5);
  const dummyMatches = selectedDummyUsers.slice(5, 10);

  // Create a Firestore batch for updating documents in parallel.
  const batch = db.batch();

  // --- STEP 3: Process one-sided likes (Kindred Spirits) ---
  for (const dummy of dummyLikes) {
    const dummyRef = db.collection("users").doc(dummy.id);
    const dummyData = dummy.data;
    dummyData.likedMatches = dummyData.likedMatches || [];
    // Simulate that the dummy user liked the current user.
    if (!dummyData.likedMatches.includes(CURRENT_USER_ID)) {
      dummyData.likedMatches.push(CURRENT_USER_ID);
      batch.update(dummyRef, { likedMatches: dummyData.likedMatches });
    }
    // For the current user, add this dummy user as a like received.
    if (!currentUserData.likesReceived.includes(dummy.id)) {
      currentUserData.likesReceived.push(dummy.id);
    }
  }

  // --- STEP 4: Process mutual matches ---
  for (const dummy of dummyMatches) {
    const dummyRef = db.collection("users").doc(dummy.id);
    const dummyData = dummy.data;
    dummyData.likedMatches = dummyData.likedMatches || [];
    dummyData.matches = dummyData.matches || [];
    
    // Simulate that the dummy user likes the current user.
    if (!dummyData.likedMatches.includes(CURRENT_USER_ID)) {
      dummyData.likedMatches.push(CURRENT_USER_ID);
    }
    // And simulate that the current user likes this dummy user (forming a mutual match)
    if (!dummyData.matches.includes(CURRENT_USER_ID)) {
      dummyData.matches.push(CURRENT_USER_ID);
    }
    batch.update(dummyRef, { 
      likedMatches: dummyData.likedMatches, 
      matches: dummyData.matches 
    });
    
    // Update current user's arrays to reflect the mutual match.
    if (!currentUserData.likedMatches.includes(dummy.id)) {
      currentUserData.likedMatches.push(dummy.id);
    }
    if (!currentUserData.matches.includes(dummy.id)) {
      currentUserData.matches.push(dummy.id);
    }
    if (!currentUserData.likesReceived.includes(dummy.id)) {
      currentUserData.likesReceived.push(dummy.id);
    }
  }
  // Update the current user's document.
  batch.update(currentUserRef, {
    likedMatches: currentUserData.likedMatches,
    matches: currentUserData.matches,
    likesReceived: currentUserData.likesReceived,
  });

  await batch.commit();
  console.log("Updated likes (including kindred spirits and mutual matches) for the current user and dummy users.");

  // --- STEP 5: Create chat conversations for mutual matches only ---
  for (const dummy of dummyMatches) {
    const chatId = [CURRENT_USER_ID, dummy.id].sort().join("_");
    const chatRef = db.collection("chats").doc(chatId);

    // Check if a conversation already exists.
    const chatSnap = await chatRef.get();
    if (chatSnap.exists) {
      console.log(`Chat conversation already exists for: ${chatId}`);
      continue;
    }

    // Create dummy messages with plain timestamp values.
    const messages = [];
    for (let i = 0; i < 5; i++) {
      const sender = i % 2 === 0 ? CURRENT_USER_ID : dummy.id;
      // Use new Date().toISOString() instead of FieldValue.serverTimestamp()
      messages.push({
        message: faker.lorem.sentence(),
        sender,
        timestamp: new Date().toISOString(),
      });
    }

    await chatRef.set({
      participants: [CURRENT_USER_ID, dummy.id],
      messages,
      createdAt: new Date().toISOString(),
    });

    console.log(`Created chat conversation: ${chatId}`);
  }

  console.log("Dummy likes and chat conversations created successfully.");
}

simulateDummyLikesAndChats()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
