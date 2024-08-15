import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import styles from "@/styles/Onboarding/LocationScreenStyles";
import MapView, { PROVIDER_GOOGLE, Marker } from "react-native-maps";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/FontAwesome";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { useUserContext } from "@/context/UserContext";

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
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState(DEFAULT_LOCATION);
  const [regionName, setRegionName] = useState(
    userData?.location?.city || "Loading..."
  );
  const [place, setPlace] = useState<
    Location.LocationGeocodedAddress[] | undefined
  >(undefined);

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
        Alert.alert("Permission to access location was denied");
        setRegion(DEFAULT_LOCATION);
        setLoading(false);
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setLocation(location);
      const newRegion = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
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
      Alert.alert("Permission to access location was denied");
      return;
    }
    let location = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setLocation(location);
    setRegion(newRegion);
    await updateRegionName(newRegion);
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
          // timezone: placeDetails.timezone || "Unknown",
        },
        latitude: region.latitude,
        longitude: region.longitude,
      });
      navigateToNextScreen();
    } catch (error) {
      Alert.alert(
        "Error",
        "Failed to save location: " +
          (error instanceof Error ? error.message : String(error))
      );
    }
  };

  return (
    <View style={styles.container}>
      <OnboardingProgressBar currentScreen="LocationScreen" />
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigateToPreviousScreen()}
      >
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Where are you rooted?</Text>
      <Text style={styles.subtitle}>
        Share your location to connect with nearby souls
      </Text>
      <Text style={styles.regionName}>{regionName}</Text>
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loadingIndicator}
          />
        ) : (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            region={region}
            onRegionChangeComplete={(newRegion) => {
              setRegion(newRegion);
              updateRegionName(newRegion);
            }}
            showsUserLocation
            showsMyLocationButton
          >
            <Marker
              coordinate={{
                latitude: region.latitude,
                longitude: region.longitude,
              }}
              title={"You are here"}
            >
              <Icon name="map-marker" size={40} color="red" />
            </Marker>
          </MapView>
        )}
        <TouchableOpacity
          style={styles.currentLocationButton}
          onPress={handleGetCurrentLocation}
        >
          <Text style={styles.buttonText}>Get Current Location</Text>
        </TouchableOpacity>
      </View>
      <Text style={styles.affirmation}>
        Ground yourself in the present moment
      </Text>
      <TouchableOpacity style={styles.continueButton} onPress={handleContinue}>
        <Icon name="chevron-right" size={24} />
      </TouchableOpacity>
    </View>
  );
};

export default LocationScreen;
