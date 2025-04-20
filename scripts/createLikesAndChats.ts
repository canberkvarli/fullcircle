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

const CURRENT_USER_ID = process.argv[2];
if (!CURRENT_USER_ID) {
  console.error("Please provide a current user ID as the first argument.");
  process.exit(1);
}

async function simulateDummyLikesAndChats(): Promise<void> {
  // STEP 1: Fetch current user's document
  const currentUserRef = db.collection("users").doc(CURRENT_USER_ID);
  const currentUserSnap = await currentUserRef.get();
  if (!currentUserSnap.exists) {
    console.error("Current user document not found!");
    process.exit(1);
  }
  const currentUserData = currentUserSnap.data() as any;
  currentUserData.likedMatches = currentUserData.likedMatches || [];
  currentUserData.matches = currentUserData.matches || [];
  currentUserData.likesReceived = currentUserData.likesReceived || [];

  // STEP 2: Fetch dummy users (all except current user)
  const usersSnapshot = await db.collection("users").get();
  const dummyUsers: Array<{ id: string; data: any }> = [];
  usersSnapshot.forEach((doc) => {
    if (doc.id !== CURRENT_USER_ID) {
      dummyUsers.push({ id: doc.id, data: doc.data() });
    }
  });
  dummyUsers.sort(() => Math.random() - 0.5);
  const selectedDummyUsers = dummyUsers.slice(0, 10);

  // Divide: first half for one-sided likes; second half for mutual matches.
  const dummyLikes = selectedDummyUsers.slice(0, 5);
  const dummyMatches = selectedDummyUsers.slice(5, 10);

  const batch = db.batch();

  // STEP 3: Process one-sided likes (kindred spirits)
  for (const dummy of dummyLikes) {
    const dummyRef = db.collection("users").doc(dummy.id);
    const dummyData = dummy.data;
    dummyData.likedMatches = dummyData.likedMatches || [];
    if (!dummyData.likedMatches.includes(CURRENT_USER_ID)) {
      dummyData.likedMatches.push(CURRENT_USER_ID);
      batch.update(dummyRef, { likedMatches: dummyData.likedMatches });
    }
    if (!currentUserData.likesReceived.includes(dummy.id)) {
      currentUserData.likesReceived.push(dummy.id);
    }
  }

  // STEP 4: Process mutual matches
  for (const dummy of dummyMatches) {
    const dummyRef = db.collection("users").doc(dummy.id);
    const dummyData = dummy.data;
    dummyData.likedMatches = dummyData.likedMatches || [];
    dummyData.matches = dummyData.matches || [];
    if (!dummyData.likedMatches.includes(CURRENT_USER_ID)) {
      dummyData.likedMatches.push(CURRENT_USER_ID);
    }
    if (!dummyData.matches.includes(CURRENT_USER_ID)) {
      dummyData.matches.push(CURRENT_USER_ID);
    }
    batch.update(dummyRef, {
      likedMatches: dummyData.likedMatches,
      matches: dummyData.matches,
    });
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
  batch.update(currentUserRef, {
    likedMatches: currentUserData.likedMatches,
    matches: currentUserData.matches,
    likesReceived: currentUserData.likesReceived,
  });

  await batch.commit();
  console.log("User likes updated.");

  // STEP 5: Create chat conversations for mutual matches with back-to-back messages.
  for (const dummy of dummyMatches) {
    const chatId = [CURRENT_USER_ID, dummy.id].sort().join("_");
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();
    if (chatSnap.exists) {
      console.log(`Chat already exists for: ${chatId}`);
      continue;
    }

    // Create a preset conversation:
    const conversation = [
      {
        text: "Hi, how are you?",
        sender: CURRENT_USER_ID,
        timestamp: new Date().toISOString(),
      },
      {
        text: "I'm good, thanks! How about you?",
        sender: dummy.id,
        timestamp: new Date().toISOString(),
      },
      {
        text: "Doing well. What have you been up to today?",
        sender: CURRENT_USER_ID,
        timestamp: new Date().toISOString(),
      },
      {
        text: "Just relaxing and enjoying some time off.",
        sender: dummy.id,
        timestamp: new Date().toISOString(),
      },
    ];

    await chatRef.set({
      participants: [CURRENT_USER_ID, dummy.id],
      messages: conversation,
      createdAt: new Date().toISOString(),
    });
    console.log(`Chat created for: ${chatId}`);
  }

  console.log("Dummy likes and chat conversations created successfully.");
}

simulateDummyLikesAndChats()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Script error:", error);
    process.exit(1);
  });
