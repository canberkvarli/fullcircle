import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import styles from "@/styles/Onboarding/PhotosScreenStyles";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { STORAGE } from "@/services/FirebaseConfig";

function PhotosScreen() {
  const {
    userData,
    updateUserData,
    navigateToPreviousScreen,
    completeOnboarding,
  } = useUserContext();
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>(
    userData?.photos || []
  );
  const [loading, setLoading] = useState<boolean>(false); // State for loading

  useEffect(() => {
    (async () => {
      const { status } =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(
          "Permission denied",
          "To be in the Circle you need to allow access to the media library."
        );
      }
    })();
  }, []);

  const handleSelectPhoto = async (index: number) => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const { uri } = result.assets[0];

      // Resize the image
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 800 } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );

      const newPhotos = [...selectedPhotos];
      newPhotos[index] = manipResult.uri;
      setSelectedPhotos(newPhotos);
    }
  };

  const handlePhotoUpload = async (photoUri: string) => {
    if (!photoUri) return null;

    const response = await fetch(photoUri);
    const blob = await response.blob();
    const storageRef = STORAGE.ref(`photos/${Date.now()}.jpg`);
    await storageRef.putFile(photoUri);
    const photoURL = await storageRef.getDownloadURL();
    return photoURL;
  };

  const handleSubmit = async () => {
    setLoading(true); // Start loading
    try {
      const filteredPhotos = selectedPhotos.filter(
        (photo) => photo !== undefined && photo !== null
      );

      if (filteredPhotos.length < 3) {
        Alert.alert("Upload Photos", "Please upload at least 3 photos.");
        return;
      }

      const uploadedPhotos = await Promise.all(
        selectedPhotos.map((photoUri) =>
          photoUri ? handlePhotoUpload(photoUri) : Promise.resolve(null)
        )
      );

      await updateUserData({
        photos: uploadedPhotos.filter(
          (photo) => photo !== null && photo !== undefined
        ),
      });

      console.log("Photos uploaded successfully!");
      completeOnboarding();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save photos: " + error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos = [...selectedPhotos];
    newPhotos[index] = "";
    setSelectedPhotos(newPhotos);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={styles.container}>
        <OnboardingProgressBar currentScreen="PhotosScreen" />
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigateToPreviousScreen()}
        >
          <Icon name="chevron-left" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.title}>Capture Your Essence</Text>
        <Text style={styles.subtitle}>Please add at least 3 photos</Text>
        <View style={styles.photosContainer}>
          {Array.from({ length: 6 }).map((_, index) => (
            <View key={index} style={styles.photoContainer}>
              <TouchableOpacity
                style={styles.photo}
                onPress={() => handleSelectPhoto(index)}
              >
                {selectedPhotos[index] ? (
                  <Image
                    source={{ uri: selectedPhotos[index] }}
                    style={styles.photoImage}
                  />
                ) : (
                  <Icon name="plus" size={30} color="white" />
                )}
              </TouchableOpacity>
              {selectedPhotos[index] && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePhoto(index)}
                >
                  <Icon name="times" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {loading ? (
          <ActivityIndicator
            size="large"
            color="#0000ff"
            style={styles.loader}
          />
        ) : (
          <TouchableOpacity style={styles.nextButton} onPress={handleSubmit}>
            <Icon name="chevron-right" size={24} color={"#D3C6BA"} />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

export default PhotosScreen;
