import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json")
  ),
  databaseURL: "https://fullcircle-3d01a-default-rtdb.firebaseio.com/",
});

const db = admin.firestore();

/**
 * Recursively deletes a document and all of its subcollections.
 */
async function deleteDocumentAndSubcollections(
  docRef: admin.firestore.DocumentReference
) {
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
}

async function cleanSeededUsers() {
  try {
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
      await deleteDocumentAndSubcollections(userDoc.ref);
      console.log(`✔ Deleted user ${userDoc.id} and all subcollection docs.`);
    }

    console.log(
      "✅ All seeded users and their subcollections have been removed."
    );
  } catch (error) {
    console.error("Error cleaning seeded users:", error);
  }
}

cleanSeededUsers().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});
