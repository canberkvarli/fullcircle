import * as path from "path";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json")
  ),
  storageBucket: "fullcircle-3d01a.appspot.com",
});

const db = admin.firestore();
const bucket = admin.storage().bucket();

// --- Updated Data Arrays to Match ACTUAL Schema ---

const genders = [
  "Woman",
  "Man", 
  "Non-binary",
  "Genderqueer",
  "Agender",
  "Genderfluid",
  "Trans Woman",
  "Trans Man",
  "Two-Spirit",
  "Bigender",
  "Intersex",
  "Other",
];

const datePreferencesArray = [
  "Men",
  "Women",
  "Non-Binary",
  "Twin Flame Seeker",
  "Soul Mate Guided",
  "Tantric Connection",
  "Heart-Centered",
  "Consciousness Explorer",
  "Polyamorous Soul",
  "Monogamous Journey",
  "Spiritual Partnership",
  "Sacred Union",
  "Love Without Labels",
  "Everyone",
];

// 🔮 Spiritual Data Arrays (EXACT from your screens)
const spiritualDrawsArray = [
  "healing",     // Healing & Restoration
  "growth",      // Personal Growth
  "connection",  // Sacred Connection
  "awakening",   // Spiritual Awakening
];

const spiritualPracticesArray = [
  "Meditation",
  "Yoga", 
  "Prayer",
  "Journaling",
  "Energy Healing",
  "Crystal Work",
  "Tarot & Oracle",
  "Astrology",
  "Nature Rituals",
  "Sound Healing",
  "Breathwork",
  "Sacred Dance",
  "Plant Medicine",
  "Shamanic Journey",
  "Martial Arts",
  "Fasting",
];

const healingModalitiesArray = [
  "Reiki",
  "Acupuncture",
  "Sound Therapy",
  "Crystal Healing",
  "Aromatherapy",
  "Light Therapy",
  "Massage Therapy",
  "Hypnotherapy",
  "Homeopathy",
  "Herbalism",
  "Ayahuasca",
  "Kambo",
];

const partnershipStylesArray = [
  "Monogamous Journey",
  "Polyamorous Soul",
  "Sacred Union",
  "Spiritual Partnership",
  "Heart-Centered Connection",
  "Twin Flame Journey",
  "Tantric Partnership",
  "Open Sacred Love",
];

// --- Helper: Fetch Unsplash images with rate limiting ---
const fetchUnsplashImages = async (
  query: string,
  count: number,
  page: number
): Promise<string[]> => {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn("No Unsplash API key found, using placeholder images");
      return Array(count).fill("https://via.placeholder.com/400x400");
    }

    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));

    const res = await fetch(
      `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(
        query
      )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=${count}`
    );
    
    if (res.status === 403) {
      console.warn("Unsplash rate limit exceeded, using placeholder images");
      return Array(count).fill("https://via.placeholder.com/400x400");
    }
    
    if (!res.ok) {
      console.warn(`Unsplash API failed (${res.status}), using placeholder images`);
      return Array(count).fill("https://via.placeholder.com/400x400");
    }
    
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      console.warn("No Unsplash results found, using placeholder images");
      return Array(count).fill("https://via.placeholder.com/400x400");
    }
    
    return data.results.map((img: any) => img.urls.small);
  } catch (error) {
    console.warn(`Unsplash fetch failed: ${error}, using placeholder images`);
    return Array(count).fill("https://via.placeholder.com/400x400");
  }
};

// --- Helper: Gender-specific photo queries (rate-limit friendly) ---
const getGenderSpecificPhotos = async (
  gender: string[],
  count: number,
  page: number
): Promise<string[]> => {
  // // For now, just use diverse placeholder images to avoid API limits
  // const placeholderColors = [
  //   "FF6B6B/FFFFFF", // Red
  //   "4ECDC4/FFFFFF", // Teal  
  //   "45B7D1/FFFFFF", // Blue
  //   "96CEB4/FFFFFF", // Green
  //   "FFEAA7/333333", // Yellow
  //   "DDA0DD/FFFFFF", // Plum
  //   "98D8C8/333333", // Mint
  //   "F7DC6F/333333", // Gold
  // ];
  
  // const primaryGender = gender[0] || "Person";
  
  // // Create diverse placeholder photos
  // const photos = Array(count).fill(null).map((_, index) => {
  //   const colorCombo = placeholderColors[index % placeholderColors.length];
  //   return `https://via.placeholder.com/400x400/${colorCombo}?text=${encodeURIComponent(primaryGender)}+${index + 1}`;
  // });
  
  // return photos;
  
  // COMMENTED OUT: Enable this when you want to use real Unsplash photos
  const primaryGender = gender[0]?.toLowerCase() || "";
  let query = "portrait";
  
  if (primaryGender === "woman" || primaryGender === "trans woman") {
    query = "beautiful woman";
  } else if (primaryGender === "man" || primaryGender === "trans man") {
    query = "handsome man";
  } else if (
    [
      "non-binary",
      "genderqueer", 
      "agender",
      "two-spirit",
      "genderfluid",
      "other",
    ].includes(primaryGender)
  ) {
    query = "non-binary model";
  }

  let photos = await fetchUnsplashImages(query, count, page);
  
  // Always return the requested number of photos, even if some are placeholders
  if (photos.length < count) {
    const needed = count - photos.length;
    const placeholders = Array(needed).fill("https://via.placeholder.com/400x400");
    photos = [...photos, ...placeholders];
  }
  
  return photos.slice(0, count); // Ensure we don't exceed the requested count
  
};

// --- Helper: Upload to Storage (with fallback) ---
const uploadPhotoToStorage = async (
  photoUrl: string,
  userId: string,
  index: number
): Promise<string> => {
  // If it's already a placeholder, just return it
  if (photoUrl.includes("placeholder.com")) {
    return photoUrl;
  }

  try {
    const res = await fetch(photoUrl);
    if (!res.ok) throw new Error(`Failed to fetch ${photoUrl}`);
    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = `users/photos/${userId}/photo_${index}.jpg`;
    const file = bucket.file(filePath);
    await file.save(buffer, {
      metadata: { contentType: res.headers.get("content-type") || "image/jpeg" },
    });
    return filePath;
  } catch (e) {
    console.warn(`Upload failed for ${photoUrl}, using placeholder:`, e);
    return `https://via.placeholder.com/400x400/cccccc/666666?text=Photo+${index + 1}`;
  }
};

// --- Generate Height in feet format ---
const generateHeight = (): number => {
  const feet = faker.number.int({ min: 4, max: 7 });
  const inches = faker.number.int({ min: 0, max: 11 });
  return parseFloat(`${feet}.${inches}`);
};

// --- Generate Phone Number Components (FIXED) ---
const generatePhoneComponents = () => {
  const areaCode = faker.string.numeric(3);
  const number = faker.string.numeric(7);
  const fullNumber = areaCode + number;
  return {
    countryCode: "1", // US country code
    areaCode: areaCode,
    number: number,
    phoneNumber: `+1${fullNumber}`,
  };
};

// --- Main Seed Function ---
async function seedFirestore(numUsers: number) {
  console.group("🔥 Starting Firestore seeding with updated schema");
  console.info(`Target number of users: ${numUsers}`);

  const usersCol = db.collection("users");
  const userIds: string[] = [];
  const userDataList: Record<string, any> = {};

  console.group("1) Generating base user documents");
  for (let i = 0; i < numUsers; i++) {
    const userId = uuidv4();
    userIds.push(userId);
    console.info(`  -> Creating user #${i + 1}/${numUsers}: ${userId}`);

    // Birth info and age calculation
    const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: "age" });
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthDate.getFullYear();
    
    // Format birth components
    const birthday = birthDate.getDate().toString().padStart(2, '0');
    const birthmonth = (birthDate.getMonth() + 1).toString().padStart(2, '0');
    const birthyear = birthDate.getFullYear().toString();

    // Gender selection (now array format)
    const primaryGender = faker.helpers.arrayElement(genders);
    const gender = [primaryGender];
    
    // Sometimes add additional gender identities
    if (faker.datatype.boolean(0.1)) {
      const additionalGender = faker.helpers.arrayElement(
        genders.filter(g => g !== primaryGender)
      );
      gender.push(additionalGender);
    }

    // Name generation based on primary gender
    let firstName = faker.person.firstName();
    let lastName = faker.person.lastName();
    if (primaryGender.toLowerCase().includes("man") && !primaryGender.toLowerCase().includes("trans")) {
      firstName = faker.person.firstName("male");
      lastName = faker.person.lastName("male");
    } else if (primaryGender.toLowerCase().includes("woman") && !primaryGender.toLowerCase().includes("trans")) {
      firstName = faker.person.firstName("female");
      lastName = faker.person.lastName("female");
    }

    // Photos generation
    const unsplashPhotos = await getGenderSpecificPhotos(
      gender,
      faker.number.int({ min: 3, max: 6 }),
      faker.number.int({ min: 1, max: 10 })
    );
    const photos = await Promise.all(
      unsplashPhotos.map((url, j) => uploadPhotoToStorage(url, userId, j))
    );

    // Location generation (SF Bay Area focused)
    const latitude = faker.number.float({ min: 36.5, max: 38.5 });
    const longitude = faker.number.float({ min: -123.5, max: -120.5 });
    const location = {
      city: faker.location.city(),
      country: "United States",
      formattedAddress: faker.location.streetAddress(),
      isoCountryCode: "US",
      name: faker.location.street(),
      postalCode: faker.location.zipCode(),
      region: faker.location.state(),
      street: faker.location.street(),
      streetNumber: faker.number.int({ min: 1, max: 5000 }).toString(),
      subregion: faker.location.county(),
    };

    // Phone number generation
    const phoneComponents = generatePhoneComponents();

    // 🔮 Spiritual Profile Generation
    const spiritualProfile = {
      draws: faker.helpers.arrayElements(
        spiritualDrawsArray,
        faker.number.int({ min: 1, max: 4 })
      ),
      practices: faker.helpers.arrayElements(
        spiritualPracticesArray,
        faker.number.int({ min: 2, max: 6 })
      ),
      healingModalities: faker.helpers.arrayElements(
        healingModalitiesArray,
        faker.number.int({ min: 1, max: 5 })
      ),
      partnershipStyle: faker.helpers.arrayElement(partnershipStylesArray),
    };

    // Match Preferences Generation (FIXED - NO MORE MATH ERRORS)
    const matchPreferences = {
      preferredAgeRange: {
        min: 18,
        max: 65,
      },
      preferredHeightRange: {
        min: 4.0,
        max: 7.0,
      },
      preferredDistance: faker.number.int({ min: 5, max: 100 }),
      datePreferences: faker.helpers.arrayElements(
        datePreferencesArray,
        faker.number.int({ min: 1, max: 3 })
      ),
      spiritualCompatibility: {
        spiritualDraws: faker.helpers.arrayElements(
          spiritualDrawsArray,
          faker.number.int({ min: 0, max: 2 })
        ),
        practices: faker.helpers.arrayElements(
          spiritualPracticesArray,
          faker.number.int({ min: 0, max: 4 })
        ),
        healingModalities: faker.helpers.arrayElements(
          healingModalitiesArray,
          faker.number.int({ min: 0, max: 3 })
        ),
        partnershipStyle: faker.helpers.arrayElements(
          partnershipStylesArray,
          faker.number.int({ min: 0, max: 2 })
        ),
      },
    };

    // Settings generation
    const settings = {
      isPaused: faker.datatype.boolean(0.05),
      showLastActiveStatus: faker.datatype.boolean(0.8),
      isSelfieVerified: faker.datatype.boolean(0.3),
      selfieVerificationDate: faker.datatype.boolean(0.3) ? 
        admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 30 })) : null,
      pushNotifications: {
        enableAll: faker.datatype.boolean(0.7),
        muteAll: faker.datatype.boolean(0.1),
        newLikes: faker.datatype.boolean(0.8),
        newMatches: faker.datatype.boolean(0.9),
        newMessages: faker.datatype.boolean(0.9),
        promotions: faker.datatype.boolean(0.4),
        announcements: faker.datatype.boolean(0.6),
      },
      connectedAccounts: {
        google: faker.datatype.boolean(0.4),
        apple: faker.datatype.boolean(0.2),
      },
    };

    // Hidden fields generation (ONLY for fields that actually exist)
    const hiddenFields: { [key: string]: boolean } = {};
    const fieldsToHide = ['gender', 'spiritualProfile', 'height', 'datePreferences'];
    fieldsToHide.forEach(field => {
      hiddenFields[field] = faker.datatype.boolean(0.2); // 20% chance to hide each field
    });

    // Timestamps
    const signupDate = faker.date.recent({ days: 60 });
    const createdAt = admin.firestore.Timestamp.fromDate(signupDate);
    const lastActive = admin.firestore.Timestamp.fromDate(
      faker.date.recent({ days: 7 })
    );

    // Orb system data
    const numOfOrbs = faker.number.int({ min: 5, max: 50 });
    const lastOrbAssignedAt = numOfOrbs > 0 ? 
      admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 7 })) : null;

    // Assemble complete user document
    userDataList[userId] = {
      // Core Identity
      userId,
      createdAt,
      lastActive,
      isSeedUser: true,
      numOfOrbs,
      lastOrbAssignedAt,
      currentOnboardingScreen: "",
      
      // Contact Info
      phoneNumber: phoneComponents.phoneNumber,
      countryCode: phoneComponents.countryCode,
      areaCode: phoneComponents.areaCode, 
      number: phoneComponents.number,
      email: faker.internet.email(),
      GoogleSSOEnabled: faker.datatype.boolean(0.3),
      marketingRequested: faker.datatype.boolean(0.6),

      // Personal Info (ONLY fields that exist in your schema)
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      birthdate: `${birthmonth}/${birthday}/${birthyear}`,
      birthday,
      birthmonth,
      birthyear,
      age,
      height: generateHeight(),
      regionName: location.region,
      longitude,
      latitude,
      gender,
      photos,
      hiddenFields,
      location,

      // 🔮 Spiritual Profile Section
      spiritualProfile,

      // Subscription & Engagement (ONLY fields that exist)
      fullCircleSubscription: faker.datatype.boolean(0.25),
      likesGivenCount: 0,
      likesReceivedCount: 0,
      matches: [],
      onboardingCompleted: true,
      onboardingCompletedAt: admin.firestore.Timestamp.fromDate(
        new Date(signupDate.getTime() + faker.number.int({ min: 300000, max: 7200000 }))
      ),

      // Match Preferences
      matchPreferences,
      
      // Settings
      settings,
    };
  }
  console.groupEnd();

  // Mark some users as radiant souls (already done above, but logging)
  console.group("2) Writing user documents to Firestore");
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
    
    // Generate likes (fewer for more realistic data)
    const likeCount = faker.number.int({ min: 0, max: 12 });
    const liked = faker.helpers.arrayElements(
      userIds.filter((u) => u !== fromUserId),
      likeCount
    );

    // Update counters (ONLY for fields that exist)
    await db
      .collection("users")
      .doc(fromUserId)
      .update({
        likesGivenCount: admin.firestore.FieldValue.increment(liked.length),
      });

    for (const toUserId of liked) {
      console.debug(`     • ${fromUserId} likes ${toUserId}`);
      
      // Create like records
      await db
        .collection("users")
        .doc(fromUserId)
        .collection("likesGiven")
        .doc(toUserId)
        .set({
          matchId: toUserId,
          viaOrb: faker.datatype.boolean(0.1), // 10% via orb
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
          viaOrb: faker.datatype.boolean(0.1),
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });
    }
  }
  console.groupEnd();

  console.log("✅ Seed complete: all users with updated schema created!");
  console.groupEnd();
}

// Run the seeding
seedFirestore(50)
  .then(() => {
    console.log("🎉 Done seeding Firestore with updated spiritual schema.");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });