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
const FieldValue = admin.firestore.FieldValue;

const CURRENT_USER_ID = process.argv[2];
if (!CURRENT_USER_ID) {
  console.error("Please provide a current user ID as the first argument.");
  process.exit(1);
}

async function simulateDummyLikesAndChats(): Promise<void> {
  const currentUserRef = db.collection("users").doc(CURRENT_USER_ID);
  const currentUserSnap = await currentUserRef.get();
  if (!currentUserSnap.exists) {
    console.error("Current user document not found!");
    process.exit(1);
  }

  // Fetch all other users
  const allUsersSnap = await db.collection("users").get();
  const others = allUsersSnap.docs
    .filter((doc) => doc.id !== CURRENT_USER_ID)
    .map((doc) => ({ id: doc.id }));
  faker.helpers.shuffle(others);

  // First 5 will just like current user, next 5 will be mutual matches
  const dummyLikes = others.slice(0, 5);
  const dummyMatches = others.slice(5, 10);

  // --- Seed free likes (others -> current) ---
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
        viaOrb: false,
        timestamp: FieldValue.serverTimestamp(),
      });
    await db
      .collection("users")
      .doc(toUserId)
      .collection("likesReceived")
      .doc(fromUserId)
      .set({
        matchId: fromUserId,
        viaOrb: false,
        timestamp: FieldValue.serverTimestamp(),
      });
  }

  // --- Seed mutual matches (both directions) ---
  for (const { id: otherId } of dummyMatches) {
    // A -> B
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
        viaOrb: false,
        timestamp: FieldValue.serverTimestamp(),
      });
    await currentUserRef.collection("likesReceived").doc(otherId).set({
      matchId: otherId,
      viaOrb: false,
      timestamp: FieldValue.serverTimestamp(),
    });

    // B -> A
    await currentUserRef.update({ likesGivenCount: FieldValue.increment(1) });
    await db
      .collection("users")
      .doc(otherId)
      .update({ likesReceivedCount: FieldValue.increment(1) });
    await currentUserRef.collection("likesGiven").doc(otherId).set({
      matchId: otherId,
      viaOrb: false,
      timestamp: FieldValue.serverTimestamp(),
    });
    await db
      .collection("users")
      .doc(otherId)
      .collection("likesReceived")
      .doc(CURRENT_USER_ID)
      .set({
        matchId: CURRENT_USER_ID,
        viaOrb: false,
        timestamp: FieldValue.serverTimestamp(),
      });

    // Delete incoming like and decrement
    await currentUserRef.update({
      likesReceivedCount: FieldValue.increment(-1),
    });
    await currentUserRef.collection("likesReceived").doc(otherId).delete();

    // Update matches arrays only (no subcollections)
    await db
      .collection("users")
      .doc(otherId)
      .update({ matches: FieldValue.arrayUnion(CURRENT_USER_ID) });
    await currentUserRef.update({ matches: FieldValue.arrayUnion(otherId) });

    // 4) Create matches subcollection documents
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

  console.log("Dummy likes and matches seeded.");

  // --- Seed chats for each mutual match ---
  for (const { id: otherId } of dummyMatches) {
    const chatId = [CURRENT_USER_ID, otherId].sort().join("_");
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();

    const now = new Date();
    const conversation = [
      {
        text: `Hey there! 👋 ${faker.hacker.phrase()}`,
        sender: CURRENT_USER_ID,
        timestamp: now,
      },
      {
        text: `${faker.hacker.ingverb()} sounds fun!`,
        sender: otherId,
        timestamp: new Date(now.getTime() + 1000),
      },
      {
        text: `Absolutely, just trying to ${faker.hacker.verb()}`,
        sender: CURRENT_USER_ID,
        timestamp: new Date(now.getTime() + 2000),
      },
      {
        text: `Let me know when you have time to ${faker.hacker.noun()}`,
        sender: otherId,
        timestamp: new Date(now.getTime() + 3000),
      },
    ];
    const lastMsg = conversation[conversation.length - 1].text;

    if (!chatSnap.exists) {
      await chatRef.set({
        participants: [CURRENT_USER_ID, otherId],
        messages: conversation,
        createdAt: FieldValue.serverTimestamp(),
        lastMessage: lastMsg,
        lastUpdated: FieldValue.serverTimestamp(),
      });
    } else {
      await chatRef.update({
        lastMessage: lastMsg,
        lastUpdated: FieldValue.serverTimestamp(),
      });
    }
  }

  console.log("Dummy chat conversations seeded successfully.");
}

simulateDummyLikesAndChats()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Script error:", err);
    process.exit(1);
  });
