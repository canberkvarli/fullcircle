import * as admin from "firebase-admin";
import { faker } from "@faker-js/faker";

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(
    require("../server/keys/fullcircle-3d01a-firebase-adminsdk-9zqec-049b194953.json")
  ),
});

const db = admin.firestore();

const seedFirestore = async (numUsers: number) => {
  const usersCollection = db.collection("users");

  for (let i = 0; i < numUsers; i++) {
    const userId = faker.string.uuid();
    const birthDate = faker.date.birthdate({ min: 18, max: 70, mode: "age" });

    const userData = {
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
      dislikedMatches: Array.from({ length: 5 }, () => faker.string.uuid()),
      educationDegree: faker.helpers.arrayElement([
        "High School",
        "Bachelor",
        "Master",
        "Doctorate",
      ]),
      email: faker.internet.email(),
      filterOptions: {
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
          min: faker.number.int({ min: 48, max: 58 }),
          max: faker.number.int({ min: 59, max: 78 }),
        },
      },
      firstName: faker.person.firstName(),
      fullCircleSubscription: faker.datatype.boolean(),
      fullName: faker.person.fullName(),
      gender: faker.helpers.arrayElement(["Man", "Woman", "Non-binary"]),
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
      likedMatches: Array.from({ length: 5 }, () => faker.string.uuid()),
    };

    try {
      await usersCollection.doc(userId).set(userData);
      console.log(`Added user ${i + 1}: ${userId}`);
    } catch (error) {
      console.error(`Error adding user ${i + 1}:`, error);
    }
  }

  console.log(`Finished adding ${numUsers} users.`);
};

seedFirestore(50).catch(console.error);
