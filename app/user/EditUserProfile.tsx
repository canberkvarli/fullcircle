import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
} from "react-native";
import { useUserContext } from "@/context/UserContext";
import Icon from "react-native-vector-icons/FontAwesome";
import * as ImagePicker from "expo-image-picker";
import DraggableFlatList from "react-native-draggable-flatlist";
import { useRouter } from "expo-router";

export default function EditUserProfileScreen() {
  const { userData, updateUserData } = useUserContext();
  const [photos, setPhotos] = useState<string[]>(userData.photos || []);
  const [tab, setTab] = useState("Edit");
  const router = useRouter();

  const pickImage = async (index: number) => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      const updatedPhotos = [...photos];
      updatedPhotos[index] = result.assets[0].uri;
      setPhotos(updatedPhotos);
      updateUserData({ photos: updatedPhotos });
    }
  };

  const handleCancel = () => {
    router.back();
  };

  const renderPhotoItem = ({ item, index }: any) => (
    <TouchableOpacity
      style={styles.photoContainer}
      onPress={() => pickImage(index)}
      key={`photo-${index}`}
    >
      <Image source={{ uri: item }} style={styles.photo} />
      <TouchableOpacity
        style={styles.removePhotoIcon}
        onPress={() => pickImage(index)}
      >
        <Icon name="times-circle" size={24} color="white" />
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userData.firstName}</Text>
        <TouchableOpacity onPress={() => console.log("Done")}>
          <Text style={styles.headerButton}>Done</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tabButton, tab === "Edit" && styles.activeTabButton]}
          onPress={() => setTab("Edit")}
        >
          <Text style={styles.tabText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, tab === "View" && styles.activeTabButton]}
          onPress={() => setTab("View")}
        >
          <Text style={styles.tabText}>View</Text>
        </TouchableOpacity>
      </View>

      {tab === "Edit" && (
        <View style={styles.contentContainer}>
          <DraggableFlatList
            data={photos}
            renderItem={renderPhotoItem}
            keyExtractor={(item, index) => `draggable-item-${item}-${index}`}
            onDragEnd={({ data }) => {
              setPhotos(data);
              updateUserData({ photos: data });
            }}
            numColumns={3} // Set the number of columns for the grid
            contentContainerStyle={styles.photoGrid}
          />

          <View style={styles.editFields}>
            <Text style={styles.fieldLabel}>First Name</Text>
            <TouchableOpacity onPress={() => console.log("Edit first name")}>
              <Text style={styles.fieldValue}>{userData.firstName}</Text>
            </TouchableOpacity>

            {/* Repeat for other user data fields */}
          </View>
        </View>
      )}

      {tab === "View" && (
        <View style={styles.contentContainer}>
          {/* Add content for the View tab */}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  headerButton: {
    fontSize: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  photoGrid: {
    justifyContent: "space-between",
    marginBottom: 16,
  },
  photoContainer: {
    flex: 1 / 3, // Ensure that each photo container takes up one-third of the row
    aspectRatio: 1,
    marginBottom: 16,
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removePhotoIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  editFields: {
    marginTop: 16,
  },
  fieldLabel: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  fieldValue: {
    fontSize: 16,
    color: "#007AFF",
    marginBottom: 16,
  },
});
