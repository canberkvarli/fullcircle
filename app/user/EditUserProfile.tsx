import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";

export default function EditUserProfile({ navigation }: any) {
  const { userData } = useUserContext();
  const [photos, setPhotos] = useState(userData.photos || []);
  const router = useRouter();

  const handlePhotoPress = (index: number) => {
    console.log(`Photo ${index} tapped`);
  };

  const handlePhotoRemove = (index: number) => {
    console.log(`Remove photo ${index} tapped`);
    // Logic to open camera roll or image picker goes here
  };

  const handleSave = () => {
    console.log("Profile saved");
    // Logic to save profile updates goes here
  };

  const handleCancel = () => {
    console.log("Profile edit canceled");
    router.back();
    // Logic to cancel profile updates goes here
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.cancelText}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.userName}>{userData.firstName}</Text>
        <TouchableOpacity onPress={handleSave}>
          <Text style={styles.doneText}>Done</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.photoGrid}>
          {photos.map((photo, index) => (
            <View key={index} style={styles.photoContainer}>
              <TouchableOpacity onPress={() => handlePhotoPress(index)}>
                <Image source={{ uri: photo }} style={styles.photo} />
                <TouchableOpacity
                  style={styles.removeIcon}
                  onPress={() => handlePhotoRemove(index)}
                >
                  <Icon name="times" size={16} color="white" />
                </TouchableOpacity>
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <Text style={styles.editHint}>Tap to edit, drag to reorder</Text>

        {/* Additional user info goes here */}
        <View style={styles.infoContainer}>
          <Text>Email: {userData.email}</Text>
          <Text>Birthdate: {userData.birthdate}</Text>
          {/* Add more fields as needed */}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  cancelText: {
    fontSize: 18,
    color: "red",
  },
  userName: {
    fontSize: 20,
    fontWeight: "bold",
  },
  doneText: {
    fontSize: 18,
    color: "blue",
  },
  scrollContent: {
    paddingBottom: 20,
  },
  photoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  photoContainer: {
    position: "relative",
    width: "30%", // Adjust as necessary
    marginBottom: 10,
  },
  photo: {
    width: "100%",
    height: 100,
    borderRadius: 8,
  },
  removeIcon: {
    position: "absolute",
    top: 5,
    right: 5,
    backgroundColor: "red",
    borderRadius: 12,
    padding: 4,
  },
  editHint: {
    color: "#7f8c8d",
    marginBottom: 16,
  },
  infoContainer: {
    // Add styling for user information
  },
});
