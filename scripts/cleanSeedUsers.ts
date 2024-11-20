import * as admin from "firebase-admin";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json")
  ),
  databaseURL: "https://fullcircle-3d01a-default-rtdb.firebaseio.com/",
});

const db = admin.firestore();

const cleanSeededUsers = async () => {
  const usersCollection = db.collection("users");

  try {
    const seededUsersSnapshot = await usersCollection
      .where("isSeedUser", "==", true)
      .get();

    if (seededUsersSnapshot.empty) {
      console.log("No seeded users found to delete.");
      return;
    }

    const batch = db.batch();

    seededUsersSnapshot.forEach((doc) => {
      batch.delete(doc.ref);
    });

    await batch.commit();
    console.log(`Deleted ${seededUsersSnapshot.size} seeded users.`);
  } catch (error) {
    console.error("Error cleaning seeded users:", error);
  }
};

cleanSeededUsers().catch(console.error);
