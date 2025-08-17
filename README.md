# FullCircle - Meaningful Connections

![FullCircle Logo](assets/images/store_badges/fullcircle_appstore.png)

Where conscious souls unite. Connect with fellow seekers who practice meditation, yoga, energy healing, and embrace mindful living.

## 📱 About

FullCircle is a conscious dating and connection app designed for individuals seeking meaningful relationships. Unlike mainstream dating apps, FullCircle focuses on compatibility, mindful matching, and authentic connections based on shared values and practices.

### 🔮 Core Features

- **Mindful Matching**: Connect with people who share your practices and values
- **Conscious Community**: Join circles of like-minded seekers on similar journeys
- **Meaningful Conversations**: Share your journey through deep dialogue about growth and awareness
- **Compatibility Matching**: Match based on practices, interests, and healing modalities
- **Dual Connection Intent**: Choose between dating, friendship, or both
- **FullCircle Premium**: Enhanced features for deeper connections

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **Authentication**: Phone verification, Google SSO
- **State Management**: React Context API (UserContext)
- **Payment Processing**: Stripe integration
- **Deployment**: iOS and Android

## 🏗️ Project Structure
```
fullcircle/
├── app/                  # Main application screens using Expo Router
│   ├── index.tsx         # Entry point landing page
│   ├── onboarding/       # Onboarding flow screens
│   ├── (tabs)/           # Main tab navigation (Connect, Spirits, Chats, Self)
│   └── user/             # User profile and settings screens
├── components/           # Reusable UI components
├── context/              # React Context providers
│   └── UserContext.tsx   # User authentication and data management
├── services/             # Firebase and API services
│   └── FirebaseConfig.tsx # Firebase configuration
├── constants/            # App-wide constants and theme settings
├── hooks/                # Custom React hooks
├── scripts/              # Utility scripts for development
└── assets/               # Images, fonts, and other static assets
```

## 🔥 Firebase Integration

The app uses Firebase as the backend with:

- **Authentication**: Phone verification with SMS and Google Sign-In
- **Firestore**: User profiles, matches, chats, and preferences
- **Storage**: User photos and media
- **Functions**: Serverless functions for matchmaking algorithms and notifications

### User Data Model

The main user data structure is defined in `UserContext.tsx` and includes:

```typescript
export type UserDataType = {
  userId: string;
  createdAt: any;
  lastActive?: any;
  isSeedUser: boolean;
  currentOnboardingScreen: string;
  phoneNumber: string;
  email?: string;
  firstName?: string;
  familyName?: string;
  fullName?: string;
  birthdate?: string;
  height?: number;
  gender?: string[];
  sexualOrientation?: string[];
  ethnicities?: string[];
  spiritualPractices?: string[];
  photos?: string[];
  location?: {
    city?: string;
    country?: string;
    formattedAddress?: string;
    // Additional location fields
  };
  fullCircleSubscription: boolean;
  matches?: string[];
  onboardingCompleted?: boolean;
  matchPreferences?: {
    preferredAgeRange?: { min: number; max: number; };
    preferredHeightRange?: { min: number; max: number; };
    preferredDistance: number;
    connectionIntent: string; // "romantic", "friendship", or "both"
    connectionPreferences: string[];
    connectionStyles: string[];
    spiritualCompatibility: {
      spiritualDraws: string[];
      practices: string[];
      healingModalities: string[];
    };
    datePreferences: string[];
  };
  settings?: UserSettings;
  // Additional fields
};
```

## ✨ Key Features

The app differentiates itself with conscious-focused features:

- **Mindful Practices**: Meditation, yoga, energy healing, etc.
- **Personal Interests**: What attracts users on a deeper level
- **Connection Styles**: How users prefer to connect with others
- **Sacred Self**: Personal profile and journey tracking
- **Kindred Spirits**: Discover and connect with like-minded people

## 💰 Subscription Model

FullCircle offers a premium subscription called "FullCircle Premium" with:

- **Enhanced Matching**: More detailed compatibility metrics
- **Advanced Filters**: Filter by practices and preferences
- **Priority Matching**: Get seen by more potential connections
- **Extended Communication**: Additional messaging features

Payment processing is handled through Stripe integration.

## 🚀 Getting Started

### Prerequisites

- Node.js (v16+)
- Yarn or npm
- React Native development environment setup
- Firebase project

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/canberkvarli/fullcircle.git
   cd fullcircle
   ```

2. Install dependencies
   ```bash
   yarn install
   ```

3. Set up environment variables
   - Create `.env` file with necessary API keys and configuration

4. Start the development server
   ```bash
   yarn start
   ```

### Firebase Configuration

The app is configured to work with Firebase in both web and native environments:

```typescript
// For React Native Firebase, configuration comes from:
// - Android: google-services.json 
// - iOS: GoogleService-Info.plist
// These files are automatically loaded based on the environment setup
const FIREBASE_APP = getApp();

export const FIREBASE_AUTH = auth();
export const FIRESTORE = firestore();
export const STORAGE = storage();
export const FUNCTIONS = functions();
```

## 📋 Scripts

Several utility scripts are available:

- **Generate Dummy Users**: Create test users for development
- **Reset Matchmaking Data**: Clear matchmaking data for testing
- **Payment Server**: Local development server for testing Stripe integration

Example usage:
```bash
# Reset matchmaking data for a specific user
npx ts-node scripts/resetMatchmakingSimple.ts user USER_ID

# Reset matchmaking data for all users
npx ts-node scripts/resetMatchmakingSimple.ts all
```

## 👥 Development Team

- **Canberk**: Lead Software Engineer & Actor (Berkeley)
- Additional team members...

## 📄 Legal

- **Terms of Service**: Users must be 18+, agree to community guidelines
- **Privacy Policy**: Detailed data collection and protection policies
- **Safety Guidelines**: Recommendations for safe user interactions

## 🔮 Vision

FullCircle aims to create a space where conscious individuals can find meaningful connections beyond the superficial swiping culture of traditional dating apps. By focusing on compatibility, mindful interactions, and authentic community, FullCircle facilitates deeper, more genuine relationships.

---

© 2025 FullCircle - Meaningful Connections