// app.config.js - Add Google Sign-In plugin
const path = require('path');
const fs = require('fs');

// Load environment variables
const envPath = path.resolve(__dirname, '.env');
if (fs.existsSync(envPath)) {
  require('dotenv').config({ path: envPath });
}

const env = process.env.EXPO_PUBLIC_ENV || 'development';

const getAppName = () => {
  switch (env) {
    case 'production': return 'FullCircle';
    case 'staging': return 'FullCircle (Staging)';
    default: return 'FullCircle (Dev)';
  }
};

const getBundleId = () => {
  console.log('🔍 getBundleId called with env:', env);
  
  switch (env) {
    case 'production': return 'com.fullcircle.app.prod';
    case 'staging': return 'com.fullcircle.app.staging';
    default: return 'com.fullcircle.app.dev';
  }
};

const getScheme = () => {
  switch (env) {
    case 'production': return 'fullcircle';
    case 'staging': return 'fullcircle-staging';
    default: return 'fullcircle-dev';
  }
};

const getStripePublishableKey = () => {
  return process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY;
};

// Get iOS URL scheme for Google Sign-In based on environment
const getGoogleIOSUrlScheme = () => {
  switch (env) {
    case 'production':
      return 'com.googleusercontent.apps.YOUR_PROD_IOS_CLIENT_ID'; // Replace with prod client ID
    case 'staging':
      return 'com.googleusercontent.apps.YOUR_STAGING_IOS_CLIENT_ID'; // Replace with staging client ID
    default:
      return 'com.googleusercontent.apps.831545660855-7hpiemj9fee6jqseipijgrn6j1ukrlp7'; // Dev iOS client ID
  }
};

module.exports = {
  expo: {
    name: getAppName(),
    slug: "fullcircle",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/images/icon.png",
    scheme: getScheme(),
    userInterfaceStyle: "automatic",
    newArchEnabled: false,
    splash: {
      image: "./assets/images/splash.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    ios: {
      supportsTablet: true,
      bundleIdentifier: getBundleId(),
      buildNumber: "1",
      deploymentTarget: "15.1",
      googleServicesFile: "./GoogleService-Info.plist",
      infoPlist: {
        CFBundleURLTypes: [
          {
            CFBundleURLName: getScheme(),
            CFBundleURLSchemes: [getScheme()]
          },
          // Add Google Sign-In URL scheme
          {
            CFBundleURLName: "GoogleSignIn",
            CFBundleURLSchemes: [getGoogleIOSUrlScheme()]
          }
        ]
      }
    },
    android: {
      package: getBundleId(),
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        foregroundImage: "./assets/images/adaptive-icon.png",
        backgroundColor: "#ffffff",
        backgroundImage: "./assets/images/adaptive-icon.png"
      },
      enableProguardInReleaseBuilds: true,
      enableShrinkResourcesInReleaseBuilds: true,
      useLegacyPackaging: true,
      config: {
        googleMaps: {
          apiKey: "AIzaSyCjHACigiDWxd6l8iZuwH6kyx5jbF3TKbg"
        }
      },
      intentFilters: [
        {
          action: "VIEW",
          category: ["DEFAULT", "BROWSABLE"],
          data: {
            scheme: getScheme()
          }
        }
      ]
    },
    web: {
      bundler: "metro",
      output: "server",
      favicon: "./assets/images/favicon.png"
    },
    plugins: [
      [
        "expo-router", {
          origin: env === 'production' ? "https://fullcircle.com" : false
        }
      ],
      "@react-native-firebase/app",
      "@react-native-firebase/auth",
      "expo-av",
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow FullCircle to use your location.",
          isAndroidForegroundServiceEnabled: true
        }
      ],
      [
        "expo-image-picker",
        {
          photosPermission: "Allow Circle to share your photos.",
          cameraPermission: "Allow Circle to access your camera to take photos."
        }
      ],
      [
        "expo-font",
        {
          fonts: [
            "./assets/fonts/poppins/Poppins-Regular.ttf"
          ]
        }
      ],
      [
        "expo-build-properties",
        {
          ios: {
            useFrameworks: "static"
          },
          android: {
            kotlinVersion: "1.9.25",
            gradleVersion: "8.8",
            kotlinCompilerExtensionVersion: "1.5.15"
          }
        }
      ],
      [
        "@stripe/stripe-react-native", {
          enableGooglePay: true,
          publishableKey: getStripePublishableKey()
        }
      ]
    ],
    experiments: {
      typedRoutes: true
    },
    extra: {
      router: {
        origin: false
      },
      UNSPLASH_ACCESS_KEY: process.env.UNSPLASH_ACCESS_KEY,
      stripePublishableKey: getStripePublishableKey(),
      eas: {
        projectId: "5e864641-186b-4d06-99f9-b7ad85439ff4"
      }
    }
  }
};