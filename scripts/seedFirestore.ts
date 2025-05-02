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
  "Undergrad",
  "Postgrad",
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

// Fetch Unsplash Images based on query
const fetchUnsplashImages = async (
  query: string,
  count: number,
  page: number
): Promise<string[]> => {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  const response = await fetch(
    `https://api.unsplash.com/search/photos?page=${page}&query=${encodeURIComponent(
      query
    )}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=${count}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Unsplash images");
  }

  const data = await response.json();
  return data.results.map((img: any) => img.urls.small);
};

// Get gender-specific photos with fallback to ensure photos are returned
const getGenderSpecificPhotos = async (
  gender: string,
  count: number,
  page: number
): Promise<string[]> => {
  const lower = gender.toLowerCase();
  let query: string;

  // check exact/trans first so “woman” doesn’t match the “man” branch
  if (lower === "woman" || lower === "trans woman") {
    query = "beautiful woman";
  } else if (lower === "man" || lower === "trans man") {
    query = "handsome man";
  } else if (
    [
      "non-binary",
      "genderqueer",
      "agender",
      "two-spirit",
      "genderfluid",
      "other",
    ].includes(lower)
  ) {
    query = "non-binary model";
  } else {
    query = "portrait";
  }

  // now fetch exactly `count` images for that query
  let photos = await fetchUnsplashImages(query, count, page);
  if (photos.length === 0) {
    console.warn(`No photos for "${query}", falling back to generic portrait.`);
    photos = await fetchUnsplashImages("portrait", count, page);
  }
  if (photos.length === 0) {
    return Array(count).fill("https://via.placeholder.com/150");
  }
  return photos;
};

// Upload a photo from a URL to Firebase Storage and return the storage path
const uploadPhotoToStorage = async (
  photoUrl: string,
  userId: string,
  index: number
): Promise<string> => {
  try {
    console.log(`Fetching photo from Unsplash: ${photoUrl}`);
    const response = await fetch(photoUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image from ${photoUrl}`);
    }
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    // Update the filePath to store under "users/photos"
    const filePath = `users/photos/${userId}/photo_${index}.jpg`;
    const file = bucket.file(filePath);
    await file.save(buffer, {
      metadata: {
        contentType: response.headers.get("content-type") || "image/jpeg",
      },
    });
    console.log(`Uploaded photo for user ${userId} to ${filePath}`);
    return filePath; // This storage path will be stored in Firestore.
  } catch (error) {
    console.error("Error uploading photo:", error);
    // Fallback: return the original URL if upload fails.
    return photoUrl;
  }
};

const lastActiveDate = new Date();
const formattedLastActive = lastActiveDate.toLocaleString("en-US", {
  weekday: "short", // e.g. "Tue"
  year: "numeric",
  month: "short", // e.g. "Dec"
  day: "numeric",
  hour: "2-digit", // e.g. "6 PM"
  minute: "2-digit",
  second: "2-digit",
  hour12: true,
  timeZoneName: "short",
});

// Seed Firestore with users
const seedFirestore = async (numUsers: number) => {
  const usersCollection = db.collection("users");

  const userIds: string[] = [];
  const userDataList: { [key: string]: any } = {};

  for (let i = 0; i < numUsers; i++) {
    const userId = uuidv4();
    userIds.push(userId);

    const birthDate = faker.date.birthdate({ min: 18, max: 70, mode: "age" });
    const birthdateFormatted = birthDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const birthday = birthDate.getDate().toString();
    const birthmonth = birthDate.toLocaleString("default", { month: "short" });
    const birthyear = birthDate.getFullYear().toString();

    const gender = faker.helpers.arrayElement(genders);

    // Get Unsplash photos then upload them to Firebase Storage.
    const unsplashPhotos = await getGenderSpecificPhotos(
      gender,
      6,
      Math.floor(Math.random() * 10) + 1
    );
    const uploadedPhotos = await Promise.all(
      unsplashPhotos.map((photoUrl, index) =>
        uploadPhotoToStorage(photoUrl, userId, index)
      )
    );

    const heightValue = parseFloat(
      `${faker.number.int({ min: 3, max: 7 })}.${faker.number.int({
        min: 0,
        max: 11,
      })}`
    );
    const randomLatitude = faker.number.float({ min: 36.5, max: 38.5 });
    const randomLongitude = faker.number.float({ min: -123.5, max: -120.5 });

    // Generate gender-specific names based on the gender value.
    let firstName: string;
    let lastName: string;
    if (
      gender.toLowerCase().includes("man") &&
      !gender.toLowerCase().includes("trans")
    ) {
      firstName = faker.person.firstName("male");
      lastName = faker.person.lastName("male");
    } else if (
      gender.toLowerCase().includes("woman") &&
      !gender.toLowerCase().includes("trans")
    ) {
      firstName = faker.person.firstName("female");
      lastName = faker.person.lastName("female");
    } else {
      firstName = faker.person.firstName();
      lastName = faker.person.lastName();
    }

    // Generate location data.
    const location = {
      city: faker.location.city(),
      country: faker.location.country(),
      formattedAddress: faker.location.streetAddress(),
      isoCountryCode: faker.location.countryCode(),
      name: faker.location.street(),
      postalCode: faker.location.zipCode(),
      region: faker.location.state(),
      street: faker.location.street(),
      streetNumber: faker.helpers.arrayElement([
        "Unknown",
        faker.number.int({ min: 1, max: 5000 }).toString(),
      ]),
      subregion: faker.location.county(),
    };

    userDataList[userId] = {
      userId,
      isSeedUser: true,
      GoogleSSOEnabled: faker.datatype.boolean(),
      age: new Date().getFullYear() - birthDate.getFullYear(),
      areaCode: faker.location.zipCode(),
      birthdate: birthdateFormatted,
      birthday,
      birthmonth,
      birthyear,
      countryCode: faker.phone.number(),
      currentOnboardingScreen: "onboarding/LandingPageScreen",
      dislikedMatches: [],
      educationDegree: faker.helpers.arrayElement(educationDegrees),
      email: faker.internet.email(),
      matchPreferences: {
        location: faker.location.city(),
        preferredAgeRange: {
          min: faker.number.int({ min: 18, max: 25 }),
          max: faker.number.int({ min: 26, max: 50 }),
        },
        preferredDistance: faker.number.int({ min: 5, max: 50 }),
        preferredEthnicities: faker.helpers.arrayElements(
          ethnicitiesArray,
          faker.number.int({ min: 1, max: 3 })
        ),
        preferredHeightRange: {
          min: faker.number.int({ min: 4, max: 5 }),
          max: faker.number.int({ min: 5, max: 9 }),
        },
        datePreferences: faker.helpers.arrayElements(
          datePreferencesArray,
          faker.number.int({ min: 1, max: 2 })
        ),
        childrenPreference: faker.helpers.arrayElement(childrenPreferences),
        preferredSpiritualPractices: faker.helpers.arrayElements(
          spiritualPracticesArray,
          faker.number.int({ min: 1, max: 3 })
        ),
        preferredSexualOrientation: faker.helpers.arrayElements(
          sexualOrientations,
          faker.number.int({ min: 1, max: 3 })
        ),
      },
      firstName,
      lastName,
      fullCircleSubscription: faker.datatype.boolean(),
      gender,
      height: heightValue,
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
      hiddenFields: {
        childrenPreference: faker.datatype.boolean(),
        datePreferences: faker.datatype.boolean(),
        educationDegree: faker.datatype.boolean(),
        ethnicities: faker.datatype.boolean(),
        fullName: faker.datatype.boolean(),
        gender: faker.datatype.boolean(),
        height: faker.datatype.boolean(),
        jobLocation: faker.datatype.boolean(),
        jobTitle: faker.datatype.boolean(),
        location: faker.datatype.boolean(),
        preferredAgeRange: faker.datatype.boolean(),
        preferredDistance: faker.datatype.boolean(),
        preferredEthnicities: faker.datatype.boolean(),
        sexualOrientation: faker.datatype.boolean(),
        spiritualPractices: faker.datatype.boolean(),
      },
      jobLocation: faker.company.name(),
      jobTitle: faker.person.jobTitle(),
      lastActive: formattedLastActive,
      latitude: randomLatitude,
      longitude: randomLongitude,
      location,
      likedMatches: [],
      likesReceived: [],
      photos: uploadedPhotos,
      matches: [],
    };
  }

  // Generate mutual likes and matches.
  userIds.forEach((userId) => {
    const likedUsers = faker.helpers.arrayElements(
      userIds.filter((id) => id !== userId),
      10
    );
    userDataList[userId].likedMatches = likedUsers;

    likedUsers.forEach((likedUserId) => {
      if (!userDataList[likedUserId]) return;
      if (!userDataList[likedUserId].likedMatches.includes(userId)) {
        userDataList[likedUserId].likesReceived.push(userId);
      } else {
        userDataList[userId].matches.push(likedUserId);
        userDataList[likedUserId].matches.push(userId);
      }
    });
  });

  // Add users to Firestore.
  for (const [userId, userData] of Object.entries(userDataList)) {
    try {
      await usersCollection.doc(userId).set(userData);
      console.log(`Added user: ${userId}`);
    } catch (error) {
      console.error(`Error adding user ${userId}:`, error);
    }
  }

  console.log(`Finished adding ${numUsers} users with mutual likes.`);
};

seedFirestore(100).catch(console.error);
