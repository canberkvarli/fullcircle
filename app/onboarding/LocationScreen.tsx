import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  useColorScheme,
  StyleSheet,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from '@expo/vector-icons';
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";


const DEFAULT_LOCATION = {
  latitude: 37.8715,
  longitude: -122.273,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const LocationScreen = () => {
  const {
    navigateToNextScreen,
    navigateToPreviousScreen,
    updateUserData,
    userData,
  } = useUserContext();

  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const fonts = useFont();
  const styles = createStyles(colorScheme, fonts);

  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [region, setRegion] = useState(DEFAULT_LOCATION);
  const [regionName, setRegionName] = useState(
    userData?.location?.city || "Loading..."
  );
  const [place, setPlace] = useState<Location.LocationGeocodedAddress[] | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android" && !(await hasLocationPermission())) {
        setRegion(DEFAULT_LOCATION);
        setLoading(false);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Sacred Space", "We need your location to connect you with nearby kindred souls");
        setRegion(DEFAULT_LOCATION);
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01, // More zoomed in for better precision
        longitudeDelta: 0.01,
      };
      setRegion(newRegion);
      await updateRegionName(newRegion);
      setLoading(false);
    })();
  }, []);

  const hasLocationPermission = async () => {
    if (Platform.OS === "android") {
      const permission = PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION;
      const hasPermission = await PermissionsAndroid.check(permission);
      if (hasPermission) return true;
      const status = await PermissionsAndroid.request(permission);
      return status === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
  };

  const handleGetCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Sacred Space", "We need your location to connect you with nearby kindred souls");
      return;
    }
    
    try {
      // Get more accurate location with higher accuracy
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01, // Smaller delta for more zoomed in view
        longitudeDelta: 0.01,
      };
      setLocation(location);
      setRegion(newRegion);
      await updateRegionName(newRegion);
    } catch (error) {
      Alert.alert("Location Error", "Could not get your precise location. Using default area.");
    }
  };

  const updateRegionName = async (
    region: Pick<Location.LocationGeocodedLocation, "latitude" | "longitude">
  ) => {
    try {
      const place = await Location.reverseGeocodeAsync(region);
      if (place.length > 0) {
        setRegionName(
          place[0].city ||
            place[0].region ||
            place[0].country ||
            "Unknown Location"
        );
        setPlace(place);
      } else {
        setRegionName("Unknown Location");
      }
    } catch (error) {
      setRegionName("Error fetching location");
    }
  };

  const handleContinue = async () => {
    try {
      const placeDetails: Location.LocationGeocodedAddress =
        place?.[0] || ({} as Location.LocationGeocodedAddress);
      await updateUserData({
        location: {
          city: regionName,
          country: placeDetails.country || "Unknown",
          formattedAddress: placeDetails.formattedAddress || "Unknown",
          isoCountryCode: placeDetails.isoCountryCode || "Unknown",
          name: placeDetails.name || "Unknown",
          postalCode: placeDetails.postalCode || "Unknown",
          region: placeDetails.region || "Unknown",
          street: placeDetails.street || "Unknown",
          streetNumber: placeDetails.streetNumber || "Unknown",
          subregion: placeDetails.subregion || "Unknown",
        },
        latitude: region.latitude,
        longitude: region.longitude,
      });
      navigateToNextScreen();
    } catch (error) {
      Alert.alert(
        "Cosmic Interference",
        "The universe had trouble saving your location: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Ionicons name="chevron-back" size={24} color={colors.textDark} />
        </TouchableOpacity>

        {/* Progress Bar */}
        <OnboardingProgressBar currentScreen="LocationScreen" />

        {/* Title */}
        <Text style={styles.title}>Where are you rooted?</Text>

        {/* Subtitle */}
        <Text style={styles.subtitle}>
          Share your sacred space to connect with nearby souls
        </Text>

        {/* Current Location Name */}
        <Text style={styles.regionName}>{regionName}</Text>

        {/* Map Container */}
        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator
                size="large"
                color={colors.primary}
                style={styles.loadingIndicator}
              />
              <Text style={styles.loadingText}>Finding your cosmic coordinates...</Text>
            </View>
          ) : (
            <>
              <MapView
                style={styles.map}
                region={region}
                onRegionChangeComplete={(newRegion) => {
                  setRegion(newRegion);
                  updateRegionName(newRegion);
                }}
                showsUserLocation={true}
                showsMyLocationButton={false}
                mapType="standard"
                followsUserLocation={false}
                showsCompass={true}
                showsScale={true}
              >
                <Marker
                  coordinate={{
                    latitude: region.latitude,
                    longitude: region.longitude,
                  }}
                  title={"Your sacred space"}
                >
                  <View style={styles.customMarker}>
                    <Ionicons name="location" size={30} color={colors.primary} />
                  </View>
                </Marker>
              </MapView>

              {/* Current Location Button */}
              <TouchableOpacity
                style={styles.currentLocationButton}
                onPress={handleGetCurrentLocation}
              >
                <Ionicons name="locate" size={16} color={colors.background} />
                <Text style={styles.buttonText}>Find My Location</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* Affirmation */}
        <Text style={styles.affirmation}>
          Ground yourself in the present moment and sacred space
        </Text>

        {/* Continue Button */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinue}
        >
          <Ionicons name="chevron-forward" size={24} color={colors.background} />
        </TouchableOpacity>
      </SafeAreaView>
  );
};

const createStyles = (colorScheme: 'light' | 'dark', fonts: Record<string, any>) => {
  const colors = Colors[colorScheme];

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      padding: Spacing.lg,
      marginTop: Platform.select({ ios: 0, android: Spacing.lg }),
    },
    backButton: {
      backgroundColor: colors.card,
      padding: Spacing.xs,
      borderRadius: BorderRadius.full,
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
      alignSelf: 'flex-start',
      marginLeft: Spacing.md,
      marginTop: Platform.select({ ios: Spacing.md, android: Spacing.lg }),
      marginBottom: 0,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        android: {
          elevation: 2,
        },
      }),
    },
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      textAlign: "left",
      marginTop: Spacing.sm,
      marginBottom: Spacing.md,
      paddingHorizontal: Spacing.lg,
    },
    subtitle: {
      ...fonts.spiritualSubtitleFont,
      color: colors.textLight,
      textAlign: "left",
      marginBottom: Spacing.xl,
      paddingHorizontal: Spacing.lg,
      fontStyle: "italic",
    },
    regionName: {
      ...fonts.spiritualBodyFont,
      color: colors.primary,
      fontSize: Typography.sizes.lg,
      marginBottom: Spacing.lg,
      textAlign: "center",
      fontStyle: "italic",
      fontWeight: Typography.weights.medium,
    },
    mapContainer: {
      width: "100%",
      height: 350, // Increased from 300
      borderRadius: BorderRadius.xl,
      overflow: "hidden",
      marginBottom: Spacing.xl,
      marginHorizontal: Spacing.md, // Add horizontal margin
      position: "relative",
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.border,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 4,
        },
      }),
    },
    map: {
      width: "100%",
      height: "100%",
    },
    customMarker: {
      backgroundColor: colors.background,
      borderRadius: BorderRadius.full,
      padding: Spacing.xs,
      borderWidth: 2,
      borderColor: colors.primary,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    currentLocationButton: {
      position: "absolute",
      bottom: Spacing.md,
      alignSelf: "center",
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.lg,
      paddingVertical: Spacing.sm,
      paddingHorizontal: Spacing.md,
      flexDirection: "row",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.3,
          shadowRadius: 4,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    buttonText: {
      ...fonts.buttonFont,
      color: colors.background,
      marginLeft: Spacing.xs,
      fontSize: Typography.sizes.sm,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colors.card,
    },
    loadingIndicator: {
      marginBottom: Spacing.md,
    },
    loadingText: {
      ...fonts.spiritualBodyFont,
      color: colors.textMuted,
      fontStyle: "italic",
    },
    affirmation: {
      ...fonts.affirmationFont,
      position: 'absolute',
      bottom: Platform.select({ ios: 130, android: 110 }),
      left: Spacing.lg,
      right: Spacing.lg,
      textAlign: "center",
      fontStyle: "italic",
      color: colors.textLight,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
    },
    continueButton: {
      position: "absolute",
      bottom: Platform.select({ ios: 50, android: 30 }),
      right: Spacing.xl,
      backgroundColor: colors.primary,
      borderRadius: BorderRadius.full,
      width: 56,
      height: 56,
      justifyContent: "center",
      alignItems: "center",
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 6 },
          shadowOpacity: 0.4,
          shadowRadius: 8,
        },
        android: {
          elevation: 8,
        },
      }),
    },
  });
};

export default LocationScreen;