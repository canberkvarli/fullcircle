#!/usr/bin/env ts-node
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { faker } from "@faker-js/faker";

// Interface for location details
export interface LocationType {
  city: string;
  country: string;
  formattedAddress: string;
  isoCountryCode: string;
  name: string;
  postalCode: string;
  region: string;
  street: string;
  streetNumber: string;
  subregion: string;
}

// Interface for potential match details
interface PotentialMatchType {
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  photos: string[];
  birthday: string;
  birthmonth: string;
  birthyear: string;
  height: string;
  ethnicities: string[];
  sexualOrientation: string[];
  matchPreferences: {
    datePreferences: string[];
    childrenPreference: string;
    preferredEthnicities: string[];
    preferredAgeRange: {
      min: number;
      max: number;
    };
    preferredDistance: number;
    desiredRelationship: string;
  };
  location: LocationType;
  educationDegree: string;
  currentOnboardingScreen: string;
  phoneNumber: string;
  countryCode: string;
  areaCode: string;
  number: string;
  likedCurrentUser?: boolean;
  fullCircleSubscription?: boolean;
}

function randomlyLikeCurrentUser(
  matches: PotentialMatchType[],
  likeProbability = 0.5
): PotentialMatchType[] {
  return matches.map((match) => {
    match.likedCurrentUser = Math.random() < likeProbability;
    return match;
  });
}

const generateRandomLocation = (): LocationType => ({
  city: faker.location.city(),
  country: faker.location.country(),
  formattedAddress: `${faker.location.streetAddress()} ${faker.location.city()}, ${faker.location.country()}`,
  isoCountryCode: faker.location.countryCode(),
  name: faker.location.city(),
  postalCode: faker.location.zipCode(),
  region: faker.location.state(),
  street: faker.location.street(),
  streetNumber: faker.location.buildingNumber(),
  subregion: faker.location.county(),
});

const generateRandomDateOfBirth = () => {
  const start = new Date(1970, 0, 1); // January 1, 1970
  const end = new Date(2000, 11, 31); // December 31, 2000
  const date = new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime())
  );
  return {
    day: String(date.getDate()).padStart(2, "0"), // Ensure day is two digits
    month: String(date.getMonth() + 1).padStart(2, "0"), // Month as two digits
    year: String(date.getFullYear()),
  };
};

const fetchUnsplashImages = async (
  query: string,
  count: number,
  page: number
): Promise<string[]> => {
  const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; // Ensure you have this environment variable set
  const response = await fetch(
    `https://api.unsplash.com/search/photos?page=${page}&query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=${count}`
  );

  if (!response.ok) {
    throw new Error("Failed to fetch Unsplash images");
  }

  const data = await response.json();
  return data.results.map((img: any) => img.urls.small);
};

// Function to generate a single potential match
const generatePotentialMatch = async (
  page: number
): Promise<PotentialMatchType> => {
  const { day, month, year } = generateRandomDateOfBirth();

  const photos = await fetchUnsplashImages("beautiful person", 6, page);

  return {
    userId: uuidv4(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    gender: Math.random() > 0.5 ? "Woman" : "Man",
    email: faker.internet.email(),
    photos: photos,
    birthday: day,
    birthmonth: month,
    birthyear: year,
    height: `${Math.floor(Math.random() * 30) + 150} cm`,
    ethnicities: faker.helpers.arrayElements(
      ["Caucasian", "Hispanic", "African", "Asian", "Other"],
      2
    ),
    sexualOrientation: faker.helpers.arrayElements(
      ["Bisexual", "Straight", "Gay", "Queer"],
      1
    ),
    matchPreferences: {
      datePreferences: faker.helpers.arrayElements(
        ["Everyone", "Men", "Women"],
        1
      ),
      childrenPreference:
        Math.random() > 0.5 ? "Open to Children" : "Don’t want Children",
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
      preferredAgeRange: {
        min: Math.floor(Math.random() * 20) + 18,
        max: Math.floor(Math.random() * 20) + 30,
      },
      preferredDistance: Math.floor(Math.random() * 100) + 1,
      desiredRelationship: faker.helpers.arrayElement([
        "Long-term Relationship",
        "Short-term Relationship",
        "Friendship",
        "Networking",
        "Casual Dating",
      ]),
    },
    location: generateRandomLocation(),
    educationDegree: faker.helpers.arrayElement([
      "High School",
      "Bachelor",
      "Master",
      "Doctorate",
    ]),
    currentOnboardingScreen: "",
    phoneNumber: faker.phone.number(),
    countryCode: faker.number.int({ min: 1, max: 100 }).toString(),
    areaCode: faker.number.int({ min: 1, max: 100 }).toString(),
    number: faker.number.int({ min: 1000000, max: 9999999 }).toString(),
    likedCurrentUser: false,
    fullCircleSubscription: Math.random() > 0.5,
  };
};

// Function to generate multiple potential matches
const generatePotentialMatches = async (
  num: number
): Promise<PotentialMatchType[]> => {
  const potentialMatches: PotentialMatchType[] = [];
  for (let i = 0; i < num; i++) {
    const page = Math.floor(Math.random() * 10) + 1; // Generate a random page number between 1 and 10
    const match = await generatePotentialMatch(page);
    potentialMatches.push(match);
  }
  return potentialMatches;
};

// File path for saving the generated data
const filePath = path.join(__dirname, "../data/potentialMatches.ts");

// Delete existing file if it exists
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}

// Generate 50 potential matches, randomly like some of them, and save to file
generatePotentialMatches(50)
  .then((potentialMatches) => {
    const likedMatches = randomlyLikeCurrentUser(potentialMatches); // Apply the liking logic

    const content = `// data/potentialMatches.ts
interface LocationType {
  city: string;
  country: string;
  formattedAddress: string;
  isoCountryCode: string;
  name: string;
  postalCode: string;
  region: string;
  street: string;
  streetNumber: string;
  subregion: string;
}

interface PotentialMatchType {
  userId: string;
  firstName: string;
  lastName: string;
  gender: string;
  email: string;
  photos: string[];
  birthday: string;
  birthmonth: string;
  birthyear: string;
  height: string;
  ethnicities: string[];
  sexualOrientation: string[];
  matchPreferences: {
    datePreferences: string[];
    childrenPreference: string;
    preferredEthnicities: string[];
    preferredAgeRange: {
      min: number;
      max: number;
    };
    preferredDistance: number;
    desiredRelationship: string;
  };
  location: LocationType;
  educationDegree: string;
  currentOnboardingScreen: string;
  phoneNumber: string;
  countryCode: string;
  areaCode: string;
  number: string;
  likedCurrentUser: boolean;
  fullCircleSubscription: boolean
}

const potentialMatches: PotentialMatchType[] = ${JSON.stringify(
      likedMatches,
      null,
      2
    )};

export default potentialMatches;
`;

    // Save to potentialMatches.ts file
    fs.writeFileSync(filePath, content, "utf8");
    console.log(
      `Generated ${likedMatches.length} potential matches and saved to ${filePath}`
    );
  })
  .catch((err) => {
    console.error("Error generating potential matches:", err);
  });
