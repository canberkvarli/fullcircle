# Circle - Sacred Connections

![Circle App Logo](https://fullcircle-3d01a.web.app/og-image.jpg)

Where sacred souls unite. Connect with fellow seekers who practice meditation, yoga, energy healing, and embrace conscious living.

## 📱 About

Circle is a spiritual dating and connection app designed for conscious individuals seeking meaningful relationships. Unlike mainstream dating apps, Circle focuses on spiritual compatibility, mindful matching, and authentic connections based on shared values and practices.

### 🔮 Core Features

- **Mindful Matching**: Connect with souls who share your spiritual practices and values
- **Conscious Community**: Join circles of like-minded seekers on similar journeys
- **Meaningful Conversations**: Share your journey through deep dialogue about growth and consciousness
- **Spiritual Compatibility**: Match based on spiritual practices, draws, and healing modalities
- **Dual Connection Intent**: Choose between dating, friendship, or both
- **FullCircle Premium**: Enhanced features for deeper spiritual connections

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo Router
- **Backend**: Firebase (Authentication, Firestore, Storage, Functions)
- **Authentication**: Phone verification, Google SSO
- **State Management**: React Context API (UserContext)
- **Payment Processing**: Stripe integration
- **Deployment**: iOS and Android

## 🏗️ Project Structure

```
circle/
├── app/                  # Main application screens using Expo Router
│   ├── index.tsx         # Entry point landing page
│   ├── onboarding/       # Onboarding flow screens
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
  isRadiantSoul?: boolean;
  numOfOrbs?: number;
  currentOnboardingScreen: string;
  phoneNumber: string;
  email?: string;
  firstName?: string;
  lastName?: string;
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

## ✨ Spiritual Features

The app differentiates itself with spiritual-focused features:

- **Spiritual Practices**: Meditation, yoga, energy healing, etc.
- **Spiritual Draws**: What attracts users on a spiritual level
- **Connection Styles**: How users prefer to connect with others
- **Radiant Souls**: Special designation for active, engaged users
- **Orbs System**: A reward mechanism for engagement

## 💰 Subscription Model

Circle offers a premium subscription called "FullCircle" with:

- **Enhanced Spiritual Matching**: More detailed compatibility metrics
- **Advanced Filters**: Filter by spiritual practices and preferences
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
   git clone https://github.com/yourusername/circle.git
   cd circle
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

Circle aims to create a space where spiritually-minded individuals can find meaningful connections beyond the superficial swiping culture of traditional dating apps. By focusing on spiritual compatibility, mindful interactions, and conscious community, Circle facilitates deeper, more authentic relationships.

---

© 2025 Circle - Sacred Connections