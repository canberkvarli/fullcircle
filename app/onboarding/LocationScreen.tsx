import React, { useState, useEffect } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
  useColorScheme,
  StyleSheet,
  Dimensions,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from '@expo/vector-icons';
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { useUserContext } from "@/context/UserContext";
import { Colors, Typography, Spacing, BorderRadius } from "@/constants/Colors";
import { useFont } from "@/hooks/useFont";
import RoundedCheckbox from "@/components/RoundedCheckbox";
import OuroborosLoader from "@/components/ouroboros/OuroborosLoader";

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

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
  const [hiddenFields, setHiddenFields] = useState<{ [key: string]: boolean }>(
    userData.hiddenFields || {}
  );

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android" && !(await hasLocationPermission())) {
        setRegion(DEFAULT_LOCATION);
        setLoading(false);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Location Needed", "We need your location to connect you with nearby people");
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
        latitudeDelta: 0.01,
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
      Alert.alert("Location Needed", "We need your location to connect you with nearby people");
      return;
    }
    
    try {
      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
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
          place[0].district ||
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

  const toggleHidden = (fieldName: string) => {
    setHiddenFields((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
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
        hiddenFields,
      });
      navigateToNextScreen();
    } catch (error) {
      Alert.alert(
        "Connection Issue",
        "We had trouble saving your location: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigateToPreviousScreen()}
      >
        <Ionicons name="chevron-back" size={24} color={colors.textDark} />
      </TouchableOpacity>

      <OnboardingProgressBar currentScreen="LocationScreen" />

      <View style={styles.content}>
        <View style={styles.headerSection}>
          <Text style={styles.title}>Where are you rooted?</Text>
        </View>

        <View style={styles.regionDisplay}>
          <Text style={styles.regionName}>{regionName}</Text>
        </View>

        <View style={styles.mapContainer}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <OuroborosLoader
                size={100}
                duration={3000}
                loop={true}
                fillColor="#F5E6D3"
                strokeColor="#7B6B5C"
                strokeWidth={1.5}
              />
              <Text style={styles.loadingText}>Finding your location...</Text>
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
                  title={"Your location"}
                >
                  <View style={styles.customMarker}>
                    <Ionicons name="location" size={30} color={colors.primary} />
                  </View>
                </Marker>
              </MapView>

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

        <View style={styles.privacyContainer}>
          <Text style={styles.privacyText}>Keep this private</Text>
          <RoundedCheckbox
            value={hiddenFields["location"] || false}
            onValueChange={() => toggleHidden("location")}
          />
        </View>

        <Text style={styles.affirmation}>
          The best connections often happen close to{' '}
          <Text style={styles.highlightedWord}>home</Text>
        </Text>
      </View>

      <TouchableOpacity
        style={styles.submitButton}
        onPress={handleContinue}
      >
        <Ionicons name="chevron-forward" size={24} color={colors.background} />
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const createStyles = (colorScheme: 'light' | 'dark', fonts: Record<string, any>) => {
  const colors = Colors[colorScheme];
  const { height } = Dimensions.get('window');
  
  // Calculate responsive map height based on screen size
  const getMapHeight = () => {
    if (height < 700) return 200;
    if (height < 800) return 240; 
    return 250; 
  };

  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
      marginTop: Platform.select({ ios: 0, android: Spacing.sm }),
    },
    content: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingBottom: 100, // Space for submit button
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
      marginTop: Platform.select({ ios: Spacing.md, android: Spacing.sm }),
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
    headerSection: {
      alignSelf: 'flex-start',
      width: '100%',
    },
    title: {
      ...fonts.spiritualTitleFont,
      color: colors.textDark,
      textAlign: "left",
      paddingHorizontal: Spacing.lg,
    },
    regionDisplay: {
      padding: Spacing.xs,
      alignItems: 'center',
      minWidth: 200,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
        },
        android: {
          elevation: 3,
        },
      }),
    },
    regionName: {
      ...fonts.spiritualTitleFont,
      fontSize: Typography.sizes['2xl'],
      color: colors.primary,
      fontWeight: Typography.weights.bold,
      marginBottom: Spacing.xs,
      textAlign: 'center',
    },
    regionLabel: {
      ...fonts.spiritualBodyFont,
      color: colors.textLight,
      fontSize: Typography.sizes.base,
      fontStyle: "normal",
    },
    mapContainer: {
      height: getMapHeight(),
      width: '95%',
      borderRadius: BorderRadius.xl,
      overflow: "hidden",
      marginBottom: Spacing.lg,
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
      fontStyle: "normal",
    },
    privacyContainer: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: colors.card,
      padding: Spacing.md,
      borderRadius: BorderRadius.xl,
      borderWidth: 1,
      borderColor: colors.border,
      marginBottom: Spacing.sm,
      ...Platform.select({
        ios: {
          shadowColor: colors.primary,
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        android: {
          elevation: 1,
        },
      }),
    },
    privacyText: {
      ...fonts.spiritualBodyFont,
      color: colors.textDark,
      fontSize: Typography.sizes.base,
      fontStyle: "normal",
      marginRight: Spacing.md,
    },
    affirmation: {
      ...fonts.elegantItalicFont,
      textAlign: "center",
      color: colors.textDark,
      lineHeight: Typography.sizes.lg * 1.5,
      letterSpacing: 0.3,
      opacity: 0.8,
      paddingHorizontal: Spacing.lg,
    },
    highlightedWord: {
      color: colors.textDark,
      textShadowColor: '#FFD700',
      textShadowOffset: { width: 0, height: 0 },
      textShadowRadius: 8,
      fontWeight: Typography.weights.medium,
      letterSpacing: 0.5,
    },
    submitButton: {
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