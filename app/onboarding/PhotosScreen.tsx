import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useUserContext } from "../../context/UserContext";
import OnboardingProgressBar from "@/components/OnboardingProgressBar";
import { STORAGE } from "@/services/FirebaseConfig";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

function PhotosScreen() {
  const {
    userData,
    updateUserData,
    navigateToNextScreen,
    navigateToPreviousScreen,
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
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
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
    const response = await fetch(photoUri);
    const blob = await response.blob();
    const storageRef = ref(STORAGE, `photos/${Date.now()}.jpg`);

    await uploadBytes(storageRef, blob);
    const photoURL = await getDownloadURL(storageRef);
    return photoURL;
  };

  const handleSubmit = async () => {
    if (selectedPhotos.filter(Boolean).length < 3) {
      Alert.alert("Upload Photos", "Please upload at least 3 photos.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const uploadedPhotos = await Promise.all(
        selectedPhotos.map((photoUri) =>
          photoUri ? handlePhotoUpload(photoUri) : Promise.resolve(null)
        )
      );

      await updateUserData({
        photos: uploadedPhotos.filter(
          (photo): photo is string => photo !== null
        ),
      });

      console.log("Photos uploaded successfully!");
      navigateToNextScreen();
    } catch (error: any) {
      Alert.alert("Error", "Failed to save photos: " + error.message);
    } finally {
      setLoading(false); // End loading
    }
  };

  const handleDeletePhoto = (index: number) => {
    const newPhotos = [...selectedPhotos];
    newPhotos[index] = ""; // Clear the selected photo
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
              {/* {selectedPhotos[index] && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeletePhoto(index)}
                >
                  <Icon name="trash" size={20} />
                </TouchableOpacity>
              )} */}
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
            <Icon name="chevron-right" size={24} />
          </TouchableOpacity>
        )}
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  backButton: {
    bottom: 20,
  },
  title: {
    fontSize: 45,
    textAlign: "left",
    marginTop: 40,
    marginBottom: 16,
    paddingHorizontal: 16,
  },
  subtitle: {
    fontSize: 18,
    textAlign: "left",
    paddingHorizontal: 16,
  },
  photosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginVertical: 20,
  },
  photoContainer: {
    position: "relative",
  },
  photo: {
    width: 130,
    height: 130,
    margin: 5,
    borderRadius: 8,
    backgroundColor: "lightblue",
    justifyContent: "center",
    alignItems: "center",
  },
  photoImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  //   deleteButton: {
  //     position: "absolute",
  //     top: 5,
  //     right: 5,
  //     left: 6,
  //   },
  nextButton: {
    position: "absolute",
    bottom: 30,
    right: 30,
    zIndex: 1,
  },
  loader: {
    position: "absolute",
    top: "50%",
    left: "50%",
    marginLeft: -12,
    marginTop: -12,
  },
});

export default PhotosScreen;
