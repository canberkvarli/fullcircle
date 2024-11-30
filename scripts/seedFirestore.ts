import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";
import { v4 as uuidv4 } from "uuid";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json")
  ),
});

const db = admin.firestore();

// Fetch Unsplash Images based on query
const fetchUnsplashImages = async (
  query: string,
  count: number,
  page: number
): Promise<string[]> => {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
  const response = await fetch(
    `https://api.unsplash.com/search/photos?page=${page}&query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=${count}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Unsplash images");
  }

  const data = await response.json();
  return data.results.map((img: any) => img.urls.small);
};

// Get gender-specific photos
const getGenderSpecificPhotos = async (
  gender: string,
  count: number,
  page: number
): Promise<string[]> => {
  const query = gender === "Man" ? "handsome man" : "beautiful woman";
  return await fetchUnsplashImages(query, count, page);
};

// Seed Firestore with users
const seedFirestore = async (numUsers: number) => {
  const usersCollection = db.collection("users");

  const userIds: string[] = [];
  const userDataList: { [key: string]: any } = {};

  for (let i = 0; i < numUsers; i++) {
    const userId = uuidv4();
    userIds.push(userId);

    const birthDate = faker.date.birthdate({ min: 18, max: 70, mode: "age" });
    const gender = faker.helpers.arrayElement(["Man", "Woman", "Non-binary"]);
    const photos = await getGenderSpecificPhotos(
      gender,
      6,
      Math.floor(Math.random() * 10) + 1
    );

    userDataList[userId] = {
      userId: uuidv4(),
      isSeedUser: true,
      GoogleSSOEnabled: faker.datatype.boolean(),
      age: new Date().getFullYear() - birthDate.getFullYear(),
      areaCode: faker.location.zipCode(),
      birthdate: birthDate.toISOString(),
      birthday: birthDate.getDate().toString(),
      birthmonth: birthDate.toLocaleString("default", { month: "short" }),
      birthyear: birthDate.getFullYear().toString(),
      childrenPreference: faker.helpers.arrayElement([
        "Don’t have children",
        "Have children",
        "Open to children",
        "Want Children",
      ]),
      countryCode: faker.phone.number(),
      currentOnboardingScreen: "onboarding/LandingPageScreen",
      datePreferences: faker.helpers.arrayElements(
        ["Men", "Women", "Everyone"],
        1
      ),
      dislikedMatches: [],
      educationDegree: faker.helpers.arrayElement([
        "High School",
        "Bachelor",
        "Master",
        "Doctorate",
      ]),
      email: faker.internet.email(),
      matchPreferences: {
        datePreferences: [],
        desiredRelationship: faker.helpers.arrayElement([
          "Serious",
          "Casual",
          "Friendship",
        ]),
        location: faker.location.city(),
        preferredAgeRange: {
          min: faker.number.int({ min: 18, max: 25 }),
          max: faker.number.int({ min: 26, max: 50 }),
        },
        preferredDistance: faker.number.int({ min: 5, max: 50 }),
        preferredEthnicities: faker.helpers.arrayElements(
          [
            "American Indian",
            "East Asian",
            "Black/African Descent",
            "Middle Eastern",
            "Hispanic Latino",
            "South Asian",
            "Pacific Islander",
            "White/Caucasian",
          ],
          3
        ),
        preferredHeightRange: {
          min: faker.number.int({ min: 4, max: 5 }),
          max: faker.number.int({ min: 5, max: 9 }),
        },
      },
      firstName: faker.person.firstName(),
      fullCircleSubscription: faker.datatype.boolean(),
      fullName: faker.person.fullName(),
      gender: gender,
      height: `${faker.number.int({ min: 4, max: 6 })}.${faker.number.int({
        min: 0,
        max: 11,
      })} ft`,
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
      lastName: faker.person.lastName(),
      lastSignInTime: faker.date.recent().toISOString(),
      latitude: faker.location.latitude(),
      longitude: faker.location.longitude(),
      likedMatches: [],
      likesReceived: [],
      photos: photos,
    };
  }

  // Generate mutual likes and matches
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
        userDataList[userId].matches = [
          ...(userDataList[userId].matches || []),
          likedUserId,
        ];
        userDataList[likedUserId].matches = [
          ...(userDataList[likedUserId].matches || []),
          userId,
        ];
      }
    });
  });

  // Add users to Firestore
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

seedFirestore(50).catch(console.error);
