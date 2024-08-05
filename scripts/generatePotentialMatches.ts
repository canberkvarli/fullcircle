#!/usr/bin/env ts-node
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import { faker } from '@faker-js/faker';

interface Location {
  city: string;
  country: string;
}

interface PotentialMatch {
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
  datePreferences: string[];
  childrenPreference: string;
  location: Location;
}

// Function to generate a random location
const generateRandomLocation = (): Location => ({
  city: faker.location.city(),
  country: faker.location.country(),
});

// Function to generate a random date of birth
const generateRandomDateOfBirth = () => {
  const start = new Date(1970, 0, 1); // January 1, 1970
  const end = new Date(2000, 11, 31); // December 31, 2000
  const date = new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  return {
    day: String(date.getDate()),
    month: faker.date.month(),
    year: String(date.getFullYear()),
  };
};

// Function to fetch Unsplash images
const fetchUnsplashImages = async (query: string, count: number, page: number): Promise<string[]> => {
    const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY; // Ensure you have this environment variable set
    const response = await fetch(`https://api.unsplash.com/search/photos?page=${page}&query=${query}&client_id=${UNSPLASH_ACCESS_KEY}&per_page=${count}`);
    
    if (!response.ok) {
      throw new Error('Failed to fetch Unsplash images');
    }
  
    const data = await response.json();
    return data.results.map((img: any) => img.urls.small);
  };
  
  // Update the generatePotentialMatch function
  const generatePotentialMatch = async (page: number): Promise<PotentialMatch> => {
    const { day, month, year } = generateRandomDateOfBirth();
    
    // Fetch images using a random page number to vary results
    const photos = await fetchUnsplashImages('beautiful woman', 6, page);
  
    return {
      userId: uuidv4(),
      firstName: faker.person.firstName(),
      lastName: faker.person.lastName(),
      gender: Math.random() > 0.5 ? 'Woman' : 'Man',
      email: faker.internet.email(),
      photos: photos,
      birthday: day,
      birthmonth: month,
      birthyear: year,
      height: `${Math.floor(Math.random() * 30) + 150} cm`, // Random height between 150 cm and 180 cm
      ethnicities: ['Caucasian', 'Hispanic', 'African', 'Asian', 'Other'],
      sexualOrientation: ['Bisexual', 'Straight', 'Gay', 'Queer'],
      datePreferences: ['Everyone', 'Men', 'Women'],
      childrenPreference: Math.random() > 0.5 ? 'Open to Children' : 'Don’t want Children',
      location: generateRandomLocation(),
    };
  };
  
  // Generate multiple potential matches with varied pages
  const generatePotentialMatches = async (num: number): Promise<PotentialMatch[]> => {
    const potentialMatches: PotentialMatch[] = [];
    for (let i = 0; i < num; i++) {
      // Generate a random page number between 1 and 10 (for example)
      const page = Math.floor(Math.random() * 10) + 1;
      const match = await generatePotentialMatch(page);
      potentialMatches.push(match);
    }
    return potentialMatches;
  };
  

// Generate 50 potential matches
const filePath = path.join(__dirname, '../data/potentialMatches.ts');

// Delete existing file if it exists
if (fs.existsSync(filePath)) {
  fs.unlinkSync(filePath);
}

generatePotentialMatches(50)
  .then((potentialMatches) => {
    // Prepare the content to save in the file
    const content = `// data/potentialMatches.ts
interface Location {
  city: string;
  country: string;
}

interface PotentialMatch {
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
  datePreferences: string[];
  childrenPreference: string;
  location: Location;
}

const potentialMatches: PotentialMatch[] = ${JSON.stringify(potentialMatches, null, 2)};

export default potentialMatches;
`;

    // Save to potentialMatches.ts file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Generated ${potentialMatches.length} potential matches and saved to ${filePath}`);
  })
  .catch((err) => {
    console.error('Error generating potential matches:', err);
  });
