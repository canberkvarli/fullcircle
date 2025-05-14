import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json")
  ),
  storageBucket: "fullcircle-3d01a.appspot.com",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// --- Dummy Data Arrays ---
const genders = [
  "Woman",
  "Man",
  "Trans Woman",
  "Trans Man",
  "Non-binary",
  "Genderqueer",
  "Agender",
  "Two-Spirit",
  "Genderfluid",
  "Other",
];

const sexualOrientations = [
  "Heterosexual (Straight)",
  "Gay (Homosexual)",
  "Lesbian",
  "Bisexual",
  "Pansexual",
  "Asexual (Ace)",
  "Demisexual",
  "Queer",
  "Polysexual",
  "Questioning",
];

const datePreferencesArray = [
  "Men",
  "Women",
  "Non-binary",
  "Genderqueer",
  "Agender",
  "Genderfluid",
  "Trans Woman",
  "Trans Man",
  "Two-Spirit",
  "Bigender",
  "Intersex",
  "Everyone",
];

const educationDegrees = [
  "High School",
  "Associate Degree",
  "Bachelor's Degree",
  "Master's Degree",
  "Doctorate",
  "Professional Certification",
];

const childrenPreferences = [
  "Don’t have children",
  "Have children",
  "Open to children",
  "Want Children",
];

const ethnicitiesArray = [
  "American Indian",
  "East Asian",
  "Black/African Descent",
  "Middle Eastern",
  "Hispanic Latino",
  "South Asian",
  "Pacific Islander",
  "White/Caucasian",
];

const spiritualPracticesArray = [
  "Hatha/Vinyasa Yoga",
  "Kundalini Yoga",
  "Yin Yoga",
  "Tantric Practices",
  "Mindfulness Meditation",
  "Breathwork",
  "Reiki (Energy Work)",
  "Chakra Healing",
  "Qi Gong",
  "Ayurveda",
  "Astrology (Western)",
  "Astrology (Vedic)",
  "Chinese Astrology",
  "Human Design & Numerology",
  "Tarot/Oracle Cards",
  "Cacao Ceremony",
  "Ayahuasca & Plant Medicine",
  "Sound Healing",
  "Ecstatic Dance",
  "Crystal Healing",
];

// --- Helper: Fetch Unsplash images ---
const fetchUnsplashImages = async (
  query: string,
  count: number,
  page: number
): Promise<string[]> => {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY!;
  const res = await fetch(
    `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(
      query
    )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=${count}`
  );
  if (!res.ok) throw new Error("Failed to fetch Unsplash images");
  const data = await res.json();
  return data.results.map((img: any) => img.urls.small);
};

// --- Helper: Gender-specific photo queries ---
const getGenderSpecificPhotos = async (
  gender: string,
  count: number,
  page: number
): Promise<string[]> => {
  const lower = gender.toLowerCase();
  let query = "portrait";
  if (lower === "woman" || lower === "trans woman") query = "beautiful woman";
  else if (lower === "man" || lower === "trans man") query = "handsome man";
  else if (
    [
      "non-binary",
      "genderqueer",
      "agender",
      "two-spirit",
      "genderfluid",
      "other",
    ].includes(lower)
  )
    query = "non-binary model";

  let photos = await fetchUnsplashImages(query, count, page);
  if (photos.length === 0)
    photos = await fetchUnsplashImages("portrait", count, page);
  return photos.length
    ? photos
    : Array(count).fill("https://via.placeholder.com/150");
};

// --- Helper: Upload to Storage ---
const uploadPhotoToStorage = async (
  photoUrl: string,
  userId: string,
  index: number
): Promise<string> => {
  try {
    const res = await fetch(photoUrl);
    if (!res.ok) throw new Error(`Failed to fetch ${photoUrl}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = `users/photos/${userId}/photo_${index}.jpg`;
    const file = bucket.file(filePath);
    await file.save(buffer, {
      metadata: { contentType: res.headers.get("content-type")! },
    });
    return filePath;
  } catch (e) {
    console.warn("Upload failed, using original URL:", e);
    return photoUrl;
  }
};

// --- Seed Script ---
async function seedFirestore(numUsers: number) {
  console.group("🔥 Starting Firestore seeding");
  console.info(`Target number of users: ${numUsers}`);

  const usersCol = db.collection("users");
  const userIds: string[] = [];
  const userDataList: Record<string, any> = {};

  console.group("1) Generating base user docs");
  for (let i = 0; i < numUsers; i++) {
    const userId = uuidv4();
    userIds.push(userId);
    console.info(`  -> Creating user #${i + 1}/${numUsers}: ${userId}`);

    // Birth info
    const birthDate = faker.date.birthdate({ min: 18, max: 70, mode: "age" });
    const birthFormatted = birthDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

    // Gender & name
    const gender = faker.helpers.arrayElement(genders);
    let firstName = faker.person.firstName();
    let lastName = faker.person.lastName();
    if (/man$/i.test(gender) && !/trans/i.test(gender)) {
      firstName = faker.person.firstName("male");
      lastName = faker.person.lastName("male");
    } else if (/woman$/i.test(gender) && !/trans/i.test(gender)) {
      firstName = faker.person.firstName("female");
      lastName = faker.person.lastName("female");
    }

    // Photos
    const unsplash = await getGenderSpecificPhotos(
      gender,
      6,
      faker.number.int({ min: 1, max: 10 })
    );
    const photos = await Promise.all(
      unsplash.map((url, j) => uploadPhotoToStorage(url, userId, j))
    );

    // Location & coords
    const latitude = faker.number.float({ min: 36.5, max: 38.5 });
    const longitude = faker.number.float({ min: -123.5, max: -120.5 });
    const location = {
      city: faker.location.city(),
      country: faker.location.country(),
      formattedAddress: faker.location.streetAddress(),
      isoCountryCode: faker.location.countryCode(),
      name: faker.location.street(),
      postalCode: faker.location.zipCode(),
      region: faker.location.state(),
      subregion: faker.location.county(),
      streetNumber: faker.helpers.arrayElement([
        "Unknown",
        faker.number.int({ min: 1, max: 5000 }).toString(),
      ]),
    };

    // generate a random signup date in the past 30 days
    const randomSignupDate = faker.date.recent(30);
    const createdAtTimestamp =
      admin.firestore.Timestamp.fromDate(randomSignupDate);
    const onboardingOffsetMs = faker.number.int({
      min: 0,
      max: 6 * 60 * 60 * 1000,
    });
    const onboardingDate = new Date(
      randomSignupDate.getTime() + onboardingOffsetMs
    );
    const onboardingCreatedAtTimestamp =
      admin.firestore.Timestamp.fromDate(onboardingDate);

    // Assemble doc
    userDataList[userId] = {
      userId,
      isSeedUser: true,
      isRadiantSoul: false,
      fullCircleSubscription: faker.datatype.boolean(),
      onboardingCompleted: true,
      // Profile
      firstName,
      lastName,
      gender,
      birthdate: birthFormatted,
      age: new Date().getFullYear() - birthDate.getFullYear(),
      countryCode: faker.phone.number(),
      areaCode: faker.location.zipCode(),
      email: faker.internet.email(),
      jobTitle: faker.person.jobTitle(),
      jobLocation: faker.company.name(),
      ethnicities: faker.helpers.arrayElements(
        ethnicitiesArray,
        faker.number.int({ min: 1, max: 3 })
      ),
      sexualOrientation: faker.helpers.arrayElements(
        sexualOrientations,
        faker.number.int({ min: 1, max: 3 })
      ),
      spiritualPractices: faker.helpers.arrayElements(
        spiritualPracticesArray,
        faker.number.int({ min: 1, max: 3 })
      ),
      educationDegree: faker.helpers.arrayElement(educationDegrees),
      childrenPreference: faker.helpers.arrayElement(childrenPreferences),
      datePreferences: faker.helpers.arrayElements(
        datePreferencesArray,
        faker.number.int({ min: 1, max: 2 })
      ),
      height: parseFloat(
        `${faker.number.int({ min: 4, max: 7 })}.${faker.number.int({
          min: 0,
          max: 11,
        })}`
      ),
      latitude,
      longitude,
      location,
      photos,

      // New counters
      likesGivenCount: 0,
      likesReceivedCount: 0,
      dislikesGivenCount: 0,
      dislikesReceivedCount: 0,

      // Matches placeholder
      matches: [],

      // ← ADDED createdAt!
      createdAt: createdAtTimestamp,
      onboardingCreatedAt: onboardingCreatedAtTimestamp,
    };
  }
  console.groupEnd();

  // mark some as radiant souls
  const radiantCount = Math.min(20, userIds.length);
  const radiantSample = faker.helpers.arrayElements(userIds, radiantCount);
  console.info(`⭐️ Marking ${radiantCount} users as isRadiantSoul`);
  // radiantSample.forEach((uid) => {
  //   userDataList[uid].isRadiantSoul = true;
  // });

  console.group("2) Writing user docs to Firestore");
  for (const [id, data] of Object.entries(userDataList)) {
    console.info(`  ↳ Writing user ${id} to Firestore`);
    await db.collection("users").doc(id).set(data);
  }
  console.groupEnd();

  console.group("3) Seeding likes sub-collections");
  for (let i = 0; i < userIds.length; i++) {
    const fromUserId = userIds[i];
    console.log(
      `  -> Seeding likes for user ${fromUserId} (${i + 1}/${userIds.length})`
    );
    const liked = faker.helpers.arrayElements(
      userIds.filter((u) => u !== fromUserId),
      5
    );

    // bump counter
    await db
      .collection("users")
      .doc(fromUserId)
      .update({
        likesGivenCount: admin.firestore.FieldValue.increment(liked.length),
      });

    for (const toUserId of liked) {
      console.debug(`     • ${fromUserId} likes ${toUserId}`);
      await db
        .collection("users")
        .doc(fromUserId)
        .collection("likesGiven")
        .doc(toUserId)
        .set({
          matchId: toUserId,
          viaOrb: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
      await db
        .collection("users")
        .doc(toUserId)
        .update({
          likesReceivedCount: admin.firestore.FieldValue.increment(1),
        });
      await db
        .collection("users")
        .doc(toUserId)
        .collection("likesReceived")
        .doc(fromUserId)
        .set({
          matchId: fromUserId,
          viaOrb: false,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
  }
  console.groupEnd();

  console.log("✅ Seed complete: all users and like-records created.");
  console.groupEnd();
}

seedFirestore(50)
  .then(() => {
    console.log("🎉 Done seeding Firestore.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });
