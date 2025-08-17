import * as path from "path";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import { SPIRITUAL_PRACTICES, HEALING_MODALITIES, SPIRITUAL_DRAWS } from "../constants/spiritualConstants";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Firebase Admin SDK with better error handling
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
        
        // Check if private key looks valid
        if (!serviceAccount.private_key.includes('-----BEGIN PRIVATE KEY-----')) {
          throw new Error("Private key format appears invalid");
        }
        
        console.log(`🔑 Service account validation passed for project: ${serviceAccount.project_id}`);
        
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
          storageBucket: `${serviceAccount.project_id}.appspot.com`,
        });
        
        console.log(`✅ Firebase initialized with service account key file: ${serviceAccount.project_id}`);
        return;
      } catch (fileError) {
        if (fileError instanceof Error) {
          console.error(`❌ Error reading/parsing service account file: ${fileError.message}`);
        } else {
          console.error("❌ Error reading/parsing service account file:", fileError);
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
      
      admin.initializeApp({
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

// Your UserDataType (keeping your existing type)
export type UserDataType = {
  userId: string;
  createdAt: any;
  lastActive?: any;
  isSeedUser: boolean;
  isRadiantSoul?: boolean;
  numOfOrbs?: number;
  lastOrbAssignedAt?: any;
  currentOnboardingScreen: string;
  phoneNumber: string;
  verificationId?: string | null;
  countryCode: string;
  areaCode: string;
  number: string;
  email?: string;
  GoogleSSOEnabled?: boolean;
  marketingRequested?: boolean;
  firstName?: string;
  familyName?: string;
  fullName?: string;
  birthdate?: string;
  birthmonth?: string;
  birthday?: string;
  birthyear?: string;
  age?: number;
  height?: number;
  regionName?: string;
  longitude?: number;
  latitude?: number;
  gender?: string[];
  sexualOrientation?: string[];
  jobLocation?: string;
  jobTitle?: string;
  spiritualPractices?: string[];
  spiritualProfile?: {
    draws?: string[];
    practices?: string[];
    healingModalities?: string[];
  };
  photos?: string[];
  hiddenFields?: { [key: string]: boolean };
  location?: {
    city?: string;
    country?: string;
    formattedAddress?: string;
    isoCountryCode?: string;
    name?: string;
    postalCode?: string;
    region?: string;
    street?: string;
    streetNumber?: string;
    subregion?: string;
  };
  fullCircleSubscription: boolean;
  likesGivenCount?: number;
  likesReceivedCount?: number;
  matches?: string[];
  onboardingCompleted?: boolean;
  onboardingCompletedAt?: any;
  matchPreferences?: {
    preferredAgeRange?: {
      min: number;
      max: number;
    };
    preferredHeightRange?: {
      min: number;
      max: number;
    };
    connectionIntent?: "romantic" | "friendship" | "both";
    childrenPreference?: string;
    preferredEthnicities?: string[];
    preferredDistance: number;
    datePreferences: string[];
    desiredRelationship?: string;
    preferredSpiritualPractices?: string[];
    spiritualCompatibility?: {
      spiritualDraws?: string[];
      practices?: string[];
      healingModalities?: string[];
    };
  };
};

// Data arrays from your old seed file
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
      // Generate diverse placeholder images instead
      const placeholderColors = [
        "FF6B6B/FFFFFF", // Red
        "4ECDC4/FFFFFF", // Teal  
        "45B7D1/FFFFFF", // Blue
        "96CEB4/FFFFFF", // Green
        "FFEAA7/333333", // Yellow
        "DDA0DD/FFFFFF", // Plum
        "98D8C8/333333", // Mint
        "F7DC6F/333333", // Gold
      ];
      
      return Array(count).fill(null).map((_, index) => {
        const colorCombo = placeholderColors[index % placeholderColors.length];
        return `https://via.placeholder.com/400x400/${colorCombo}?text=User+${index + 1}`;
      });
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

// Generate dummy user data matching your UserDataType
async function generateDummyUser(): Promise<UserDataType> {
  const firstName = faker.person.firstName();
  const familyName = faker.person.lastName();
  const age = faker.number.int({ min: 18, max: 65 });
  const birthYear = new Date().getFullYear() - age;
  
  // Birth date components
  const birthDate = faker.date.birthdate({ min: 18, max: 65, mode: "age" });
  const birthMonths = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
  ];
  const birthday = birthDate.getDate().toString();
  const birthmonth = birthMonths[birthDate.getMonth()];
  const birthyear = birthDate.getFullYear().toString();
  const birthdate = `${birthmonth} ${birthday}, ${birthyear}`;

  // Gender selection (array format)
  const primaryGender = faker.helpers.arrayElement(genders);
  const gender = [primaryGender];

  // Generate photos based on gender
  const photos = await getGenderSpecificPhotos(
    gender,
    faker.number.int({ min: 3, max: 6 }),
    faker.number.int({ min: 1, max: 10 })
  );

  // Phone number components
  const areaCode = faker.string.numeric(3);
  const number = faker.string.numeric(7);
  const fullNumber = areaCode + number;

  return {
    userId: uuidv4(),
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastActive: admin.firestore.FieldValue.serverTimestamp(),
    isSeedUser: true,
    isRadiantSoul: faker.datatype.boolean(),
    numOfOrbs: faker.number.int({ min: 0, max: 10 }),
    lastOrbAssignedAt: faker.datatype.boolean() ? admin.firestore.FieldValue.serverTimestamp() : null,
    currentOnboardingScreen: "completed",
    phoneNumber: `+1${fullNumber}`,
    countryCode: "1",
    areaCode: areaCode,
    number: number,
    email: faker.internet.email(),
    GoogleSSOEnabled: faker.datatype.boolean(),
    marketingRequested: faker.datatype.boolean(),
    firstName,
    familyName,
    fullName: `${firstName} ${familyName}`,
    birthdate,
    birthday,
    birthmonth,
    birthyear,
    age,
    height: faker.number.int({ min: 4, max: 7 }), // feet
    regionName: faker.location.state(),
    longitude: faker.location.longitude({ min: -122.5, max: -121.5 }), // San Francisco Bay Area
    latitude: faker.location.latitude({ min: 37.5, max: 38.5 }), // San Francisco Bay Area
    gender,
    sexualOrientation: faker.helpers.arrayElements(sexualOrientations, { min: 1, max: 2 }),
    jobLocation: faker.location.city(),
    jobTitle: faker.person.jobTitle(),
    spiritualPractices: faker.helpers.arrayElements(SPIRITUAL_PRACTICES, { min: 0, max: 5 }),
    spiritualProfile: {
      draws: faker.helpers.arrayElements(SPIRITUAL_DRAWS, { min: 1, max: 4 }),
      practices: faker.helpers.arrayElements(SPIRITUAL_PRACTICES, { min: 1, max: 5 }),
      healingModalities: faker.helpers.arrayElements(HEALING_MODALITIES, { min: 1, max: 5 }),
    },
    photos: photos,
    hiddenFields: {
      gender: faker.datatype.boolean(0.2),
      height: faker.datatype.boolean(0.2),
      location: faker.datatype.boolean(0.1),
      spiritualPractices: faker.datatype.boolean(0.15),
    },
    location: {
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
    },
    fullCircleSubscription: faker.datatype.boolean(0.25), // 25% have subscription
    likesGivenCount: faker.number.int({ min: 0, max: 50 }),
    likesReceivedCount: faker.number.int({ min: 0, max: 100 }),
    matches: [],
    onboardingCompleted: true,
    onboardingCompletedAt: admin.firestore.FieldValue.serverTimestamp(),
    matchPreferences: {
      preferredAgeRange: {
        min: Math.max(18, age - 10),
        max: Math.min(65, age + 10),
      },
      preferredHeightRange: {
        min: 4,
        max: 7,
      },
      connectionIntent: faker.helpers.arrayElement(['romantic', 'friendship', 'both']),
      childrenPreference: faker.helpers.arrayElement(['Want', 'Don\'t want', 'Maybe', 'Open to children']),
      preferredEthnicities: [], // Removed as per edit hint
      preferredDistance: faker.number.int({ min: 25, max: 100 }),
      datePreferences: faker.helpers.arrayElements(['Coffee', 'Dinner', 'Drinks', 'Activity', 'Spiritual Practice'], { min: 1, max: 3 }),
      desiredRelationship: faker.helpers.arrayElement(['Casual', 'Serious', 'Marriage', 'Spiritual Partnership']),
      preferredSpiritualPractices: faker.helpers.arrayElements(SPIRITUAL_PRACTICES, { min: 0, max: 3 }),
      spiritualCompatibility: {
        spiritualDraws: faker.helpers.arrayElements(SPIRITUAL_DRAWS, { min: 1, max: 4 }),
        practices: faker.helpers.arrayElements(SPIRITUAL_PRACTICES, { min: 1, max: 5 }),
        healingModalities: faker.helpers.arrayElements(HEALING_MODALITIES, { min: 1, max: 5 }),
      },
    },
  };
}

async function seedFirestore() {
  try {
    // Initialize Firebase first
    await initializeFirebase();
    
    const db = admin.firestore();
    const numberOfUsers = 50;
    
    console.log(`🌱 Starting to seed ${numberOfUsers} users...`);
    console.log(`📸 ${process.env.UNSPLASH_ACCESS_KEY ? 'Using Unsplash for photos' : 'Using placeholder images'}`);

    const batch = db.batch();
    const users: UserDataType[] = [];
    
    for (let i = 0; i < numberOfUsers; i++) {
      console.log(`📝 Generating user ${i + 1}/${numberOfUsers}...`);
      const userData = await generateDummyUser();
      users.push(userData);
      
      const userRef = db.collection('users').doc(userData.userId);
      batch.set(userRef, userData);
      
      // Add delay between photo fetches to respect rate limits
      if (i < numberOfUsers - 1) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
    }

    console.log(`💾 Writing ${numberOfUsers} users to Firestore...`);
    await batch.commit();
    console.log(`✅ Successfully seeded ${numberOfUsers} users to Firestore!`);
    
    // Generate some likes between users
    console.log(`💕 Generating likes between users...`);
    const likeBatch = db.batch();
    
    for (let i = 0; i < users.length; i++) {
      const fromUser = users[i];
      const potentialMatches = users.filter(u => u.userId !== fromUser.userId);
      const likes = faker.helpers.arrayElements(potentialMatches, { min: 0, max: 8 });
      
      for (const likedUser of likes) {
        // Update like counts
        const fromUserRef = db.collection('users').doc(fromUser.userId);
        const toUserRef = db.collection('users').doc(likedUser.userId);
        
        likeBatch.update(fromUserRef, {
          likesGivenCount: admin.firestore.FieldValue.increment(1)
        });
        
        likeBatch.update(toUserRef, {
          likesReceivedCount: admin.firestore.FieldValue.increment(1)
        });
      }
    }
    
    await likeBatch.commit();
    console.log(`✅ Generated likes between users!`);
    
    // Optionally create some sample app settings
    const settingsRef = db.collection('appSettings').doc('global');
    await settingsRef.set({
      appVersion: '1.0.0',
      maintenanceMode: false,
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      dailyLikeLimit: 8,
      orbSystem: {
        enabled: true,
        maxOrbs: 50,
        orbRefreshRate: 24, // hours
      }
    });
    
    console.log(`✅ Created app settings document`);
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
    process.exit(1);
  }
}

// Run the seeding function
seedFirestore()
  .then(() => {
    console.log("🎉 Seeding completed successfully!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  });