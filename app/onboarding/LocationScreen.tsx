import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
} from "react-native";
import MapView, { PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";

const DEFAULT_LOCATION = {
  latitude: 36.7783,
  longitude: -119.4179,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

const LocationScreen = () => {
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null
  );
  const [region, setRegion] = useState(DEFAULT_LOCATION);
  const [regionName, setRegionName] = useState("Loading...");
  const [loading, setLoading] = useState(true);
  const { navigateToNextScreen, navigateToPreviousScreen, updateUserData } =
    useUserContext();

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
      console.log("new Region from get Current Location:", newRegion);
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
    console.log("location from Location Expo:", location);
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
      const [place] = await Location.reverseGeocodeAsync(region);
      if (place) {
        setRegionName(
          place.city || place.region || place.country || "Unknown Location"
        );
      } else {
        setRegionName("Unknown Location");
      }
    } catch (error) {
      setRegionName("Error fetching location");
    }
  };

  const handleContinue = async () => {
    try {
      await updateUserData({
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
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigateToPreviousScreen()}
      >
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Where are you rooted?</Text>
      <Text style={styles.subtitle}>
        Share your location to connect with nearby souls.
      </Text>
      <Text style={styles.regionName}>{regionName}</Text>
      <View style={styles.mapContainer}>
        {loading ? (
          <ActivityIndicator size="large" color="#0000ff" />
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
            <View style={styles.markerFixed}>
              <Icon name="map-marker" size={40} color="red" />
            </View>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 50,
    marginBottom: 30,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 16,
    textAlign: "center",
  },
  regionName: {
    fontSize: 16,
    marginBottom: 16,
    textAlign: "center",
  },
  mapContainer: {
    width: "100%",
    height: 300,
    borderRadius: 20,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  map: {
    width: "100%",
    height: "100%",
  },
  markerFixed: {
    position: "absolute",
    left: "50%",
    top: "50%",
    marginLeft: -20,
    marginTop: -40,
  },
  currentLocationButton: {
    position: "absolute",
    bottom: 10,
    left: "50%",
    transform: [{ translateX: -100 }],
    backgroundColor: "#000",
    borderRadius: 20,
    paddingVertical: 10,
    paddingHorizontal: 20,
    zIndex: 1,
  },
  buttonText: {
    color: "white",
    fontSize: 16,
  },
  affirmation: {
    position: "absolute",
    bottom: 70,
    textAlign: "center",
    width: "100%",
    fontStyle: "italic",
    color: "gray",
  },
  continueButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LocationScreen;
