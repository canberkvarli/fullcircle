import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  TextInput,
  ScrollView,
  ActivityIndicator,
  PermissionsAndroid,
  Platform,
  Alert,
} from "react-native";
import styles from "@/styles/User/EditFieldScreenStyles";
import Checkbox from "expo-checkbox";
import { useUserContext } from "@/context/UserContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";
import { RulerPicker } from "react-native-ruler-picker";
import MapView, { Marker } from "react-native-maps";
import * as Location from "expo-location";
import useFieldState from "@/hooks/useFieldState";

const DEFAULT_REGION = {
  latitude: 37.8715,
  longitude: -122.273,
  latitudeDelta: 0.0922,
  longitudeDelta: 0.0421,
};

function EditFieldScreen() {
  const router = useRouter();
  const { updateUserData, userData } = useUserContext();
  const { fieldName } = useLocalSearchParams();

  // For datePreferences, get the value from matchPreferences.
  const currentFieldValue =
    fieldName === "datePreferences"
      ? userData.matchPreferences?.datePreferences || null
      : (userData as any)[fieldName as string] || null;
  const isHidden =
    (userData.hiddenFields as any)?.[fieldName as string] === false;
  const fieldState = useFieldState(fieldName as string, currentFieldValue);
  const {
    OPTIONS,
    selectedGender,
    setSelectedGender,
    selectedOrientations,
    setSelectedOrientations,
    selectedDatePreferences,
    setSelectedDatePreferences,
    selectedEducation,
    setSelectedEducation,
    jobLocation,
    setJobLocation,
    jobTitle,
    setJobTitle,
    customInput,
    setCustomInput,
    fieldConfig,
    firstName,
    setFirstName,
    lastName,
    setLastName,
    selectedHeight,
    setSelectedHeight,
    selectedChildrenPreferences,
    setSelectedChildrenPreferences,
    selectedEthnicities,
    setSelectedEthnicities,
    selectedSpiritualPractices,
    setSelectedSpiritualPractices,
    location, // initial location string if any
    setLocation,
  } = fieldState;

  const [isVisible, setIsVisible] = useState(isHidden);

  // For location editing
  const [mapRegion, setMapRegion] = useState(DEFAULT_REGION);
  const [regionName, setRegionName] = useState("Loading...");
  const [loading, setLoading] = useState(true);

  const fieldTitleMap: Record<string, string> = {
    gender: "Gender",
    datePreferences: "I'm interested in",
    childrenPreference: "Family Vision",
    jobLocation: "Work",
    jobTitle: "Job Title",
    educationDegree: "Education Level",
    firstName: "First Name",
    lastName: "Last Name",
    height: "Height",
    location: "Location",
    ethnicities: "Ethnic Root",
    spiritualPractices: "Spiritual Practices",
  };

  useEffect(() => {
    if (fieldName === "location") {
      (async () => {
        if (Platform.OS === "android" && !(await hasLocationPermission())) {
          setMapRegion(DEFAULT_REGION);
          setLoading(false);
          return;
        }
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Permission to access location was denied");
          setMapRegion(DEFAULT_REGION);
          setLoading(false);
          return;
        }
        let loc = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setMapRegion(newRegion);
        await updateRegionName(newRegion);
        setLoading(false);
      })();
    }
  }, [fieldName]);

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

  const updateRegionName = async (region: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      const places = await Location.reverseGeocodeAsync(region);
      if (places.length > 0) {
        setRegionName(
          places[0].city ||
            places[0].region ||
            places[0].country ||
            "Unknown Location"
        );
      } else {
        setRegionName("Unknown Location");
      }
    } catch (error) {
      setRegionName("Error fetching location");
    }
  };

  const handleGetCurrentLocation = async () => {
    let { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission to access location was denied");
      return;
    }
    let loc = await Location.getCurrentPositionAsync({});
    const newRegion = {
      latitude: loc.coords.latitude,
      longitude: loc.coords.longitude,
      latitudeDelta: 0.0922,
      longitudeDelta: 0.0421,
    };
    setMapRegion(newRegion);
    await updateRegionName(newRegion);
  };

  const handleSave = async () => {
    const config = fieldConfig[fieldName as string];
    let newFieldValue;

    if (fieldName === "fullName") {
      if (!firstName) {
        alert("First name is required.");
        return;
      }
      newFieldValue = lastName ? `${firstName} ${lastName}` : firstName;
    } else if (fieldName === "height") {
      newFieldValue = selectedHeight;
    } else if (fieldName === "gender") {
      if (
        selectedGender.length === 0 ||
        (selectedGender.includes("Other") && !customInput)
      ) {
        alert(
          "Please select at least one gender and provide input for 'Other' if selected."
        );
        return;
      }
      newFieldValue = selectedGender.map((g) =>
        g === "Other" ? customInput : g
      );
    } else if (fieldName === "datePreferences") {
      // If no option is selected or if "Everyone" is selected,
      // default to ["Open to All"]
      if (
        selectedDatePreferences.length === 0 ||
        selectedDatePreferences.includes("Everyone")
      ) {
        newFieldValue = ["Open to All"];
      } else {
        newFieldValue = selectedDatePreferences;
      }
    } else if (fieldName === "location") {
      newFieldValue = {
        city: regionName,
        latitude: mapRegion.latitude,
        longitude: mapRegion.longitude,
      };
    } else {
      newFieldValue = config?.selectedValue;
    }

    const isModified =
      JSON.stringify(newFieldValue) !== JSON.stringify(currentFieldValue) ||
      isVisible !== isHidden;

    if (isModified) {
      // For datePreferences, save under matchPreferences.
      if (fieldName === "datePreferences") {
        const existingMatchPrefs = userData.matchPreferences || {
          preferredAgeRange: { min: 18, max: 99 },
          preferredHeightRange: { min: 3, max: 8 },
          preferredEthnicities: [],
          preferredDistance: 100,
          datePreferences: [],
          desiredRelationship: "Not Specified",
          preferredSpiritualPractices: [],
        };
        const updatedMatchPrefs = {
          ...existingMatchPrefs,
          datePreferences: newFieldValue,
        };
        await updateUserData({
          matchPreferences: updatedMatchPrefs,
          hiddenFields: {
            ...userData.hiddenFields,
            [fieldName as string]: !isVisible,
          },
        });
      } else {
        await updateUserData({
          [fieldName as string]: newFieldValue,
          hiddenFields: {
            ...userData.hiddenFields,
            [fieldName as string]: !isVisible,
          },
        });
      }
    }
    router.back();
  };

  const handleDatePreferenceSelection = (title: string) => {
    if (title === "Everyone") {
      setSelectedDatePreferences(["Everyone"]);
    } else {
      setSelectedDatePreferences((prev: string[]) => {
        const withoutEveryone = prev.filter((pref) => pref !== "Everyone");
        if (withoutEveryone.includes(title)) {
          return withoutEveryone.filter((pref) => pref !== title);
        } else {
          return [...withoutEveryone, title];
        }
      });
    }
  };

  const renderHeightPicker = () => (
    <View style={styles.heightPickerContainer}>
      <RulerPicker
        min={3}
        max={8}
        step={0.1}
        unit="ft"
        fractionDigits={1}
        initialValue={selectedHeight}
        onValueChange={(value) => setSelectedHeight(Number(value))}
      />
    </View>
  );

  const renderAgeSection = () => {
    const { age, birthdate } = userData;
    return (
      <View style={styles.ageContainer}>
        <Text style={styles.ageText}>{age}</Text>
        <Text style={styles.birthdateText}>{birthdate}</Text>
        <Text style={styles.noticeText}>
          Please contact the Circle team to change your age. This requires you
          to upload your ID.
        </Text>
      </View>
    );
  };

  const renderOption = (
    option: string | { title: string; subtitle?: string; input?: boolean }
  ) => {
    const title = typeof option === "string" ? option : option.title;
    const subtitle = typeof option === "string" ? null : option.subtitle;
    const input = typeof option === "string" ? false : option.input;
    let isSelected = false;

    if (fieldName === "gender") {
      isSelected = selectedGender.includes(title);
    } else if (fieldName === "datePreferences") {
      isSelected = selectedDatePreferences.includes(title);
    } else if (fieldName === "educationDegree") {
      isSelected = selectedEducation === title;
    } else if (fieldName === "ethnicities") {
      isSelected = selectedEthnicities.includes(title);
    } else if (fieldName === "childrenPreference") {
      isSelected = (selectedChildrenPreferences || []).includes(title);
    } else if (fieldName === "spiritualPractices") {
      isSelected = (selectedSpiritualPractices as string[]).includes(title);
    }

    return (
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => {
          if (fieldName === "gender") {
            setSelectedGender((prev: string[]) =>
              prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
            );
            if (title === "Other" && !selectedGender.includes("Other")) {
              setCustomInput("");
            }
          } else if (fieldName === "datePreferences") {
            handleDatePreferenceSelection(title);
          } else if (fieldName === "educationDegree") {
            setSelectedEducation(title);
          } else if (fieldName === "childrenPreference") {
            setSelectedChildrenPreferences(title);
          } else if (fieldName === "spiritualPractices") {
            setSelectedSpiritualPractices((prev: string[]) =>
              prev.includes(title)
                ? prev.filter((item) => item !== title)
                : [...prev, title]
            );
          }
        }}
      >
        <View>
          <Text style={styles.optionText}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
          {input && selectedGender.includes("Other") && (
            <TextInput
              style={styles.input}
              placeholder="Enter here"
              value={customInput}
              onChangeText={setCustomInput}
            />
          )}
        </View>
        <Checkbox value={isSelected} />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSave}>
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {fieldTitleMap[fieldName as string] ||
          (typeof fieldName === "string"
            ? fieldName
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
            : fieldName)}
      </Text>

      <ScrollView style={styles.scrollContainer}>
        {fieldName === "fullName" && (
          <>
            <TextInput
              style={styles.workInput}
              placeholder="First Name"
              value={firstName}
              onChangeText={setFirstName}
            />
            <TextInput
              style={styles.workInput}
              placeholder="Last Name"
              value={lastName}
              onChangeText={setLastName}
            />
            <Text
              style={styles.optionalText}
              onPress={() => console.log("Why is clicked")}
            >
              Last name is optional, and only shared with matches. Why?
            </Text>
          </>
        )}

        {(fieldName === "jobLocation" || fieldName === "jobTitle") && (
          <TextInput
            style={styles.workInput}
            placeholder={`Enter ${fieldTitleMap[fieldName as string]}`}
            value={fieldName === "jobLocation" ? jobLocation : jobTitle}
            onChangeText={
              fieldName === "jobLocation" ? setJobLocation : setJobTitle
            }
          />
        )}

        {fieldName === "location" ? (
          <View style={styles.mapContainer}>
            <Text style={styles.regionName}>{regionName}</Text>
            {loading ? (
              <ActivityIndicator
                size="large"
                color="black"
                style={styles.loadingIndicator}
              />
            ) : (
              <MapView
                style={styles.map}
                region={mapRegion}
                onRegionChangeComplete={(newRegion) => {
                  setMapRegion(newRegion);
                  updateRegionName(newRegion);
                }}
                showsUserLocation
                showsMyLocationButton
              >
                <Marker
                  coordinate={{
                    latitude: mapRegion.latitude,
                    longitude: mapRegion.longitude,
                  }}
                  title={"You are here"}
                />
              </MapView>
            )}
            <TouchableOpacity
              style={styles.currentLocationButton}
              onPress={handleGetCurrentLocation}
            >
              <Text style={styles.buttonText}>Get Current Location</Text>
            </TouchableOpacity>
          </View>
        ) : fieldName !== "jobLocation" &&
          fieldName !== "jobTitle" &&
          fieldName !== "firstName" ? (
          <FlatList
            data={
              OPTIONS[fieldName as keyof typeof OPTIONS] as Array<
                string | { title: string; subtitle?: string; input?: boolean }
              >
            }
            renderItem={({ item }) => renderOption(item)}
            keyExtractor={(item) =>
              typeof item === "string" ? item : item.title
            }
            scrollEnabled={false}
          />
        ) : null}

        {fieldName === "age" && renderAgeSection()}
        {fieldName === "height" && renderHeightPicker()}
      </ScrollView>

      <View style={styles.visibilityContainer}>
        <Text style={styles.visibilityText}>
          {isVisible ? "Visible" : "Hidden"} on profile
        </Text>
        <TouchableOpacity onPress={() => setIsVisible((prev) => !prev)}>
          <Icon
            name={isVisible ? "eye" : "eye-slash"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

export default EditFieldScreen;
