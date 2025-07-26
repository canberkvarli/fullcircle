import * as path from "path";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

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
    // Option 3: Try default application credentials (if running on Google Cloud or with GOOGLE_APPLICATION_CREDENTIALS)
    try {
      app = admin.initializeApp({
        storageBucket: "fullcircle-3d01a.appspot.com",
      });
      console.log("✅ Firebase initialized with default application credentials");
    } catch (defaultError) {
      console.error("❌ Could not initialize Firebase. Please ensure you have:");
      console.error("1. Service account key file at: ../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json");
      console.error("2. OR environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL");
      console.error("3. OR GOOGLE_APPLICATION_CREDENTIALS environment variable");
      console.error("\nPrivate key error details:", envError);
      process.exit(1);
    }
  }
}

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

// Updated connection intents and preferences
const connectionIntents = ["romantic", "friendship", "both"];

const connectionPreferences = [
  "Men",
  "Women", 
  "Non-Binary",
  "Everyone",
];

// Connection styles for romantic
const romanticStyles = [
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
];

// Connection styles for friendship
const friendshipStyles = [
  "Practice Partners",
  "Meditation Buddies",
  "Adventure Seekers",
  "Study Circles",
  "Healing Circles",
  "Creative Collaborators",
  "Retreat Companions",
  "Wisdom Sharers",
  "Community Builders",
  "Soul Supporters",
];

// Combined styles for "both"
const combinedStyles = [...romanticStyles, ...friendshipStyles];

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
  "Plant Medicine",
];

// --- FIXED: Improved Unsplash fetching with better error handling ---
const fetchUnsplashImages = async (
  query: string,
  count: number,
  page: number
): Promise<string[]> => {
  try {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
    if (!UNSPLASH_ACCESS_KEY) {
      console.warn("🚨 No Unsplash API key found, using Picsum photos");
      return Array(count).fill(null).map((_, index) => 
        `https://picsum.photos/400/400?random=${Date.now() + index}`
      );
    }

    console.log(`🔍 Fetching ${count} photos from Unsplash: "${query}"`);
    
    // Add delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));

    const res = await fetch(
      `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(
        query
      )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=${count}&orientation=portrait`
    );
    
    if (res.status === 403) {
      console.warn("🚨 Unsplash rate limit exceeded, using Picsum photos");
      return Array(count).fill(null).map((_, index) => 
        `https://picsum.photos/400/400?random=${Date.now() + index}`
      );
    }
    
    if (!res.ok) {
      console.warn(`🚨 Unsplash API failed (${res.status}), using Picsum photos`);
      return Array(count).fill(null).map((_, index) => 
        `https://picsum.photos/400/400?random=${Date.now() + index}`
      );
    }
    
    const data = await res.json();
    if (!data.results || data.results.length === 0) {
      console.warn("🚨 No Unsplash results found, using Picsum photos");
      return Array(count).fill(null).map((_, index) => 
        `https://picsum.photos/400/400?random=${Date.now() + index}`
      );
    }
    
    const photos = data.results.map((img: any) => img.urls.regular || img.urls.small);
    console.log(`✅ Got ${photos.length} photos from Unsplash`);
    
    // Fill remaining with Picsum if needed
    if (photos.length < count) {
      const needed = count - photos.length;
      const picsumPhotos = Array(needed).fill(null).map((_, index) => 
        `https://picsum.photos/400/400?random=${Date.now() + photos.length + index}`
      );
      photos.push(...picsumPhotos);
    }
    
    return photos.slice(0, count);
  } catch (error) {
    console.warn(`🚨 Unsplash fetch failed: ${error}, using Picsum photos`);
    return Array(count).fill(null).map((_, index) => 
      `https://picsum.photos/400/400?random=${Date.now() + index}`
    );
  }
};

// --- Helper: Gender-specific photo queries (rate-limit friendly) ---
const getGenderSpecificPhotos = async (
  gender: string[],
  count: number,
  page: number
): Promise<string[]> => {
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
  
  // Always return the requested number of photos
  if (photos.length < count) {
    const needed = count - photos.length;
    const picsumPhotos = Array(needed).fill(null).map((_, index) => 
      `https://picsum.photos/400/400?random=${Date.now() + photos.length + index}`
    );
    photos = [...photos, ...picsumPhotos];
  }
  
  return photos.slice(0, count);
};

// --- FIXED: Upload to Storage with proper fallback handling ---
const uploadPhotoToStorage = async (
  photoUrl: string,
  userId: string,
  index: number
): Promise<string> => {
  try {
    console.log(`📸 Uploading photo ${index + 1} for user ${userId.slice(0, 8)}...: ${photoUrl}`);
    
    const res = await fetch(photoUrl);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    
    const contentType = res.headers.get("content-type");
    if (!contentType?.startsWith("image/")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }
    
    const buffer = Buffer.from(await res.arrayBuffer());
    const filePath = `users/photos/${userId}/photo_${index}.jpg`;
    const file = bucket.file(filePath);
    
    await file.save(buffer, {
      metadata: { 
        contentType: "image/jpeg",
        metadata: {
          source: photoUrl.includes('unsplash') ? "unsplash" : "picsum",
          originalUrl: photoUrl
        }
      },
    });
    
    console.log(`✅ Successfully uploaded: ${filePath}`);
    return filePath; // Return Firebase Storage path
  } catch (e: any) {
    console.warn(`❌ Upload failed for ${photoUrl}:`, e.message);
    
    // Try a different Picsum photo as fallback
    const fallbackUrl = `https://picsum.photos/400/400?random=${index + Date.now()}`;
    console.log(`🔄 Trying fallback: ${fallbackUrl}`);
    
    try {
      const fallbackRes = await fetch(fallbackUrl);
      if (fallbackRes.ok) {
        const fallbackBuffer = Buffer.from(await fallbackRes.arrayBuffer());
        const filePath = `users/photos/${userId}/photo_${index}.jpg`;
        const file = bucket.file(filePath);
        
        await file.save(fallbackBuffer, {
          metadata: { 
            contentType: "image/jpeg",
            metadata: {
              source: "picsum-fallback"
            }
          },
        });
        
        console.log(`✅ Fallback upload successful: ${filePath}`);
        return filePath;
      }
    } catch (fallbackError: any) {
      console.warn(`❌ Fallback also failed:`, fallbackError.message);
    }
    
    // Last resort: return a working image URL that can be used directly
    return `https://picsum.photos/400/400?random=${index + Date.now()}`;
  }
};

// --- Generate Height in feet format ---
const generateHeight = (): number => {
  const feet = faker.number.int({ min: 4, max: 7 });
  const inches = faker.number.int({ min: 0, max: 11 });
  return parseFloat(`${feet}.${inches < 10 ? '0' + inches : inches}`);
};

// --- Generate Phone Number Components ---
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

// --- Generate Match Preferences Based on Connection Intent ---
const generateMatchPreferences = (connectionIntent: string) => {
  const basePreferences = {
    preferredAgeRange: {
      min: faker.number.int({ min: 18, max: 25 }),
      max: faker.number.int({ min: 30, max: 65 }),
    },
    preferredHeightRange: {
      min: faker.number.int({ min: 3, max: 5 }),
      max: faker.number.int({ min: 6, max: 8 }),
    },
    preferredDistance: faker.number.int({ min: 5, max: 100 }),
    connectionIntent: connectionIntent as "romantic" | "friendship" | "both",
  };

  // Connection preferences based on intent
  let connectionPrefs: string[] = [];
  if (connectionIntent === "romantic" || connectionIntent === "both") {
    connectionPrefs = faker.helpers.arrayElements(
      connectionPreferences,
      faker.number.int({ min: 1, max: 3 })
    );
  } else {
    connectionPrefs = ["Everyone"]; // Friendship is generally open to all
  }

  // Connection styles based on intent
  let connectionStylesArray: string[] = [];
  if (connectionIntent === "romantic") {
    connectionStylesArray = romanticStyles;
  } else if (connectionIntent === "friendship") {
    connectionStylesArray = friendshipStyles;
  } else {
    connectionStylesArray = combinedStyles;
  }

  const connectionStyles = faker.helpers.arrayElements(
    connectionStylesArray,
    faker.number.int({ min: 1, max: 4 })
  );

  // Spiritual compatibility preferences
  const spiritualCompatibility = {
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
  };

  return {
    ...basePreferences,
    connectionPreferences: connectionPrefs,
    connectionStyles: connectionStyles,
    datePreferences: connectionIntent === "romantic" ? connectionPrefs : [], // Backward compatibility
    spiritualCompatibility,
  };
};

// --- Main Seed Function ---
async function seedFirestore(numUsers: number) {
  console.group("🔥 Starting Firestore seeding with REAL photos");
  console.info(`Target number of users: ${numUsers}`);

  const usersCol = db.collection("users");
  const userIds: string[] = [];
  const userDataList: Record<string, any> = {};

  console.group("📸 Generating users with real photos");
  for (let i = 0; i < numUsers; i++) {
    const userId = uuidv4();
    userIds.push(userId);

    // Birth info and age calculation
    const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: "age" });
    const currentYear = new Date().getFullYear();
    const age = currentYear - birthDate.getFullYear();
    
    // Format birth components properly
    const birthMonths = [
      "Jan", "Feb", "Mar", "Apr", "May", "Jun",
      "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
    ];
    const birthday = birthDate.getDate().toString();
    const birthmonth = birthMonths[birthDate.getMonth()];
    const birthyear = birthDate.getFullYear().toString();
    const birthdate = `${birthmonth} ${birthday}, ${birthyear}`;

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

    console.info(`👤 Creating user #${i + 1}/${numUsers}: ${firstName} (${primaryGender})`);

    // Photos generation with better logging
    console.log(`📸 Fetching photos for ${firstName} (${primaryGender})...`);
    const unsplashPhotos = await getGenderSpecificPhotos(
      gender,
      faker.number.int({ min: 3, max: 6 }),
      faker.number.int({ min: 1, max: 10 })
    );
    
    console.log(`📤 Uploading ${unsplashPhotos.length} photos to Firebase Storage...`);
    const photos = await Promise.all(
      unsplashPhotos.map((url, j) => uploadPhotoToStorage(url, userId, j))
    );
    
    console.log(`✅ User ${firstName} photos: ${photos.length} uploaded successfully`);
    console.log(`   Photo paths:`, photos.map(p => p.includes('users/') ? p.split('/').pop() : 'external-url'));

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
    };

    // Generate connection intent and match preferences
    const connectionIntent = faker.helpers.arrayElement(connectionIntents);
    const matchPreferences = generateMatchPreferences(connectionIntent);

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

    // Hidden fields generation (matching your actual field names)
    const hiddenFields: { [key: string]: boolean } = {};
    const fieldsToHide = [
      'gender', 
      'height', 
      'connectionPreferences', 
      'location',
      'spiritualProfile'
    ];
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
    const numOfOrbs = faker.number.int({ min: 1, max: 50 });
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
      currentOnboardingScreen: "Connect", // Completed onboarding
      
      // Contact Info
      phoneNumber: phoneComponents.phoneNumber,
      countryCode: phoneComponents.countryCode,
      areaCode: phoneComponents.areaCode, 
      number: phoneComponents.number,
      email: faker.internet.email(),
      GoogleSSOEnabled: faker.datatype.boolean(0.3),
      marketingRequested: faker.datatype.boolean(0.6),

      // Personal Info
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`,
      birthdate,
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

      // Engagement
      likesGivenCount: 0,
      likesReceivedCount: 0,
      dislikesGivenCount: 0,
      dislikesReceivedCount: 0,
      matches: [],
      onboardingCompleted: true,
      onboardingCompletedAt: admin.firestore.Timestamp.fromDate(
        new Date(signupDate.getTime() + faker.number.int({ min: 300000, max: 7200000 }))
      ),

      // Match Preferences
      matchPreferences,

      // Boosts & Daily Limits
      activeBoosts: faker.number.int({ min: 0, max: 10 }),
      boostExpiresAt: null,
      boostPurchases: [],
      dailyLikesCount: faker.number.int({ min: 0, max: 8 }),
      lastLikeResetDate: admin.firestore.Timestamp.fromDate(faker.date.recent({ days: 1 })),
      DAILY_LIKE_LIMIT: 8,
      reportedUsers: [],
      unmatchedUsers: [],
      
      // Settings
      settings,
    };
  }
  console.groupEnd();

  console.group("2) Writing user documents to Firestore");
  for (const [id, data] of Object.entries(userDataList)) {
    console.info(`  ↳ Writing user ${data.firstName} (${id.slice(0, 8)}...) to Firestore`);
    await db.collection("users").doc(id).set(data);
  }
  console.groupEnd();

  console.group("3) Seeding likes sub-collections");
  for (let i = 0; i < userIds.length; i++) {
    const fromUserId = userIds[i];
    const fromUserData = userDataList[fromUserId];
    console.log(
      `  -> Seeding likes for ${fromUserData.firstName} (${i + 1}/${userIds.length})`
    );
    
    // Generate likes (fewer for more realistic data)
    const likeCount = faker.number.int({ min: 0, max: 12 });
    const liked = faker.helpers.arrayElements(
      userIds.filter((u) => u !== fromUserId),
      likeCount
    );

    // Update counters
    await db
      .collection("users")
      .doc(fromUserId)
      .update({
        likesGivenCount: admin.firestore.FieldValue.increment(liked.length),
      });

    for (const toUserId of liked) {
      const toUserData = userDataList[toUserId];
      console.debug(`     • ${fromUserData.firstName} likes ${toUserData.firstName}`);
      
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

  console.log("✅ Seed complete: all users created with REAL photos!");
  console.groupEnd();
}

// Run the seeding
seedFirestore(50)
  .then(() => {
    console.log("🎉 Done seeding Firestore with real photos from Unsplash/Picsum!");
    process.exit(0);
  })
  .catch((err) => {
    console.error("❌ Seeding error:", err);
    process.exit(1);
  });