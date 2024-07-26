import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  PermissionsAndroid,
  Platform,
} from "react-native";
import MapView, { Marker, PROVIDER_GOOGLE } from "react-native-maps";
import * as Location from "expo-location";
import { Ionicons } from "@expo/vector-icons";
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
  const { navigateToNextScreen, navigateToPreviousScreen, updateUserData } =
    useUserContext();

  useEffect(() => {
    (async () => {
      if (Platform.OS === "android" && !(await hasLocationPermission())) {
        setRegion(DEFAULT_LOCATION);
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission to access location was denied");
        setRegion(DEFAULT_LOCATION);
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
    console.log("handleGetCurrentLocation");
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

  const updateRegionName = async (region: {
    latitude: number;
    longitude: number;
  }) => {
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
        <Ionicons name="chevron-back" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.title}>Where are you rooted?</Text>
      <Text style={styles.subtitle}>
        Share your location to connect with nearby souls.
      </Text>
      <Text style={styles.regionName}>{regionName}</Text>
      <View style={styles.mapContainer}>
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
          {location && (
            <Marker
              coordinate={{
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
              }}
              title={"You are here"}
              pinColor="blue"
            />
          )}
        </MapView>
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
        <Ionicons name="chevron-forward" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  backButton: {
    position: "absolute",
    top: 40,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 24,
    marginBottom: 16,
    textAlign: "center",
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
    textAlign: "center",
    fontStyle: "italic",
    color: "gray",
    marginBottom: 40,
  },
  continueButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    backgroundColor: "#000",
    borderRadius: 50,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
});

export default LocationScreen;
