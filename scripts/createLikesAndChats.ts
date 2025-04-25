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
  const currentUserData = currentUserSnap.data() as any;
  currentUserData.likedMatches = currentUserData.likedMatches || [];
  currentUserData.matches = currentUserData.matches || [];
  currentUserData.likesReceived = currentUserData.likesReceived || [];

  const allUsersSnap = await db.collection("users").get();
  const others = allUsersSnap.docs
    .filter((d) => d.id !== CURRENT_USER_ID)
    .map((d) => ({ id: d.id, data: d.data() as any }));
  faker.helpers.shuffle(others);
  const [dummyLikes, dummyMatches] = [others.slice(0, 5), others.slice(5, 10)];

  const batch = db.batch();

  dummyLikes.forEach(({ id, data }) => {
    const docRef = db.collection("users").doc(id);
    const liked = data.likedMatches || [];
    if (!liked.includes(CURRENT_USER_ID)) {
      liked.push(CURRENT_USER_ID);
      batch.update(docRef, { likedMatches: liked });
    }
    if (!currentUserData.likesReceived.includes(id)) {
      currentUserData.likesReceived.push(id);
    }
  });

  dummyMatches.forEach(({ id, data }) => {
    const docRef = db.collection("users").doc(id);
    const liked = data.likedMatches || [];
    const matched = data.matches || [];
    if (!liked.includes(CURRENT_USER_ID)) liked.push(CURRENT_USER_ID);
    if (!matched.includes(CURRENT_USER_ID)) matched.push(CURRENT_USER_ID);
    batch.update(docRef, {
      likedMatches: liked,
      matches: matched,
    });

    if (!currentUserData.likedMatches.includes(id))
      currentUserData.likedMatches.push(id);
    if (!currentUserData.matches.includes(id)) currentUserData.matches.push(id);
    if (!currentUserData.likesReceived.includes(id))
      currentUserData.likesReceived.push(id);
  });

  batch.update(currentUserRef, {
    likedMatches: currentUserData.likedMatches,
    matches: currentUserData.matches,
    likesReceived: currentUserData.likesReceived,
  });
  await batch.commit();
  console.log("User likes and matches updated.");

  for (const { id: otherId } of dummyMatches) {
    const chatId = [CURRENT_USER_ID, otherId].sort().join("_");
    const chatRef = db.collection("chats").doc(chatId);
    const chatSnap = await chatRef.get();

    const conversation = [
      {
        text: "Hey there! 👋 " + faker.hacker.phrase(),
        sender: CURRENT_USER_ID,
        timestamp: new Date().toISOString(),
      },
      {
        text: faker.hacker.ingverb() + " sounds fun!",
        sender: otherId,
        timestamp: new Date().toISOString(),
      },
      {
        text: "Absolutely, just trying to " + faker.hacker.verb(),
        sender: CURRENT_USER_ID,
        timestamp: new Date().toISOString(),
      },
      {
        text: "Let me know when you have time to " + faker.hacker.noun(),
        sender: otherId,
        timestamp: new Date().toISOString(),
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
      console.log(`Created chat ${chatId} with lastMessage: "${lastMsg}"`);
    } else {
      await chatRef.update({
        lastMessage: lastMsg,
        lastUpdated: FieldValue.serverTimestamp(),
      });
      console.log(`Updated chat ${chatId} lastMessage to: "${lastMsg}"`);
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
