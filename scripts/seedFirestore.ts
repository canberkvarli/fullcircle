import * as path from "path";
import * as dotenv from "dotenv";
import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

// Initialize Firebase Admin SDK
let app: admin.app.App;

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
        return path.resolve(__dirname, "../server/keys/fullcircle-dev-firebase-adminsdk.json");
    }
  };

  const keyFilePath = getKeyFilePath();
  
  if (require('fs').existsSync(keyFilePath)) {
    const serviceAccount = require(keyFilePath);
    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: `${serviceAccount.project_id}.appspot.com`,
    });
    console.log(`✅ Firebase initialized with service account key file: ${serviceAccount.project_id}`);
  } else {
    // Option 2: Fall back to environment variables
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

      const projectId = process.env.FIREBASE_PROJECT_ID;
      
      app = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: projectId,
          privateKey: privateKey,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        }),
        storageBucket: `${projectId}.appspot.com`,
      });
      
      console.log(`✅ Firebase initialized with environment variables: ${projectId}`);
    } else {
      throw new Error("Missing Firebase credentials");
    }
  }
} catch (error) {
  console.error("❌ Could not initialize Firebase. Please ensure you have:");
  console.error("1. Service account key file in server/keys/ folder");
  console.error("2. OR environment variables: FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL");
  console.error("\nError details:", error);
  process.exit(1);
}

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

// Your UserDataType from UserContext
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
  lastName?: string;
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
  ethnicities?: string[];
  jobLocation?: string;
  jobTitle?: string;
  educationDegree?: string;
  spiritualPractices?: string[];
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
    childrenPreference?: string;
    preferredEthnicities?: string[];
    preferredDistance: number;
    datePreferences: string[];
    desiredRelationship?: string;
    preferredSpiritualPractices?: string[];
  };
};

// Generate dummy user data matching your UserDataType
function generateDummyUser(): UserDataType {
  const firstName = faker.person.firstName();
  const lastName = faker.person.lastName();
  const age = faker.number.int({ min: 18, max: 65 });
  const birthYear = new Date().getFullYear() - age;
  
  return {
    userId: uuidv4(),
    createdAt: FieldValue.serverTimestamp(),
    lastActive: FieldValue.serverTimestamp(),
    isSeedUser: true,
    isRadiantSoul: faker.datatype.boolean(),
    numOfOrbs: faker.number.int({ min: 0, max: 10 }),
    currentOnboardingScreen: "completed",
    phoneNumber: faker.phone.number(),
    countryCode: "+1",
    areaCode: faker.location.zipCode().substring(0, 3),
    number: faker.phone.number(),
    email: faker.internet.email(),
    GoogleSSOEnabled: faker.datatype.boolean(),
    marketingRequested: faker.datatype.boolean(),
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`,
    birthyear: birthYear.toString(),
    age,
    height: faker.number.int({ min: 150, max: 200 }), // cm
    regionName: faker.location.state(),
    longitude: faker.location.longitude(),
    latitude: faker.location.latitude(),
    gender: [faker.person.sex()],
    sexualOrientation: [faker.helpers.arrayElement(['Straight', 'Gay', 'Lesbian', 'Bisexual', 'Pansexual'])],
    ethnicities: [faker.helpers.arrayElement(['White', 'Black', 'Asian', 'Hispanic', 'Mixed', 'Other'])],
    jobLocation: faker.location.city(),
    jobTitle: faker.person.jobTitle(),
    educationDegree: faker.helpers.arrayElement(['High School', 'Bachelor\'s', 'Master\'s', 'PhD']),
    spiritualPractices: faker.helpers.arrayElements(['Meditation', 'Yoga', 'Christianity', 'Buddhism', 'Hinduism'], { min: 0, max: 3 }),
    photos: Array.from({ length: faker.number.int({ min: 1, max: 6 }) }, () => faker.image.avatar()),
    location: {
      city: faker.location.city(),
      country: faker.location.country(),
      formattedAddress: faker.location.streetAddress(),
      region: faker.location.state(),
      postalCode: faker.location.zipCode(),
    },
    fullCircleSubscription: faker.datatype.boolean(),
    likesGivenCount: faker.number.int({ min: 0, max: 100 }),
    likesReceivedCount: faker.number.int({ min: 0, max: 100 }),
    matches: [],
    onboardingCompleted: true,
    onboardingCompletedAt: FieldValue.serverTimestamp(),
    matchPreferences: {
      preferredAgeRange: {
        min: Math.max(18, age - 10),
        max: Math.min(65, age + 10),
      },
      preferredHeightRange: {
        min: 150,
        max: 200,
      },
      childrenPreference: faker.helpers.arrayElement(['Want', 'Don\'t want', 'Maybe']),
      preferredEthnicities: faker.helpers.arrayElements(['White', 'Black', 'Asian', 'Hispanic', 'Mixed'], { min: 1, max: 3 }),
      preferredDistance: faker.number.int({ min: 5, max: 50 }),
      datePreferences: faker.helpers.arrayElements(['Coffee', 'Dinner', 'Drinks', 'Activity'], { min: 1, max: 3 }),
      desiredRelationship: faker.helpers.arrayElement(['Casual', 'Serious', 'Marriage']),
      preferredSpiritualPractices: faker.helpers.arrayElements(['Meditation', 'Yoga', 'Christianity', 'Buddhism'], { min: 0, max: 2 }),
    },
  };
}

async function seedFirestore() {
  try {
    const numberOfUsers = 50; // Adjust as needed
    console.log(`🌱 Starting to seed ${numberOfUsers} users to ${process.env.FIREBASE_PROJECT_ID}...`);

    const batch = db.batch();
    
    for (let i = 0; i < numberOfUsers; i++) {
      const userData = generateDummyUser();
      const userRef = db.collection('users').doc(userData.userId);
      batch.set(userRef, userData);
      
      if (i % 10 === 0) {
        console.log(`📝 Generated ${i + 1}/${numberOfUsers} users...`);
      }
    }

    await batch.commit();
    console.log(`✅ Successfully seeded ${numberOfUsers} users to Firestore!`);
    
    // Optionally create some sample collections
    const settingsRef = db.collection('appSettings').doc('global');
    await settingsRef.set({
      appVersion: '1.0.0',
      maintenanceMode: false,
      lastUpdated: FieldValue.serverTimestamp(),
    });
    
    console.log(`✅ Created app settings document`);
    
  } catch (error) {
    console.error('❌ Error seeding Firestore:', error);
  } finally {
    process.exit(0);
  }
}

// Run the seeding function
seedFirestore();