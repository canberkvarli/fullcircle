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
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from "react-native-draggable-flatlist";
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

  const renderPhotoItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<string>) => {
    const index = getIndex?.() ?? 0;

    return (
      <ScaleDecorator>
        <TouchableOpacity
          style={[
            styles.photoContainer,
            { backgroundColor: isActive ? "#f0f0f0" : "transparent" },
          ]}
          disabled={isActive}
          onLongPress={drag}
          activeOpacity={1}
        >
          <TouchableOpacity
            onPress={() => pickImage(index)}
            style={styles.photoTouchable}
          >
            <Image source={{ uri: item }} style={styles.photo} />
            <TouchableOpacity
              style={styles.removePhotoIcon}
              onPress={() => {
                const updatedPhotos = photos.filter((_, i) => i !== index);
                setPhotos(updatedPhotos);
                updateUserData({ photos: updatedPhotos });
              }}
            >
              <Icon name="times-circle" size={24} color="white" />
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

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
          <View style={styles.photosContainer}>
            <DraggableFlatList
              data={photos}
              renderItem={renderPhotoItem}
              keyExtractor={(item, index) => `draggable-item-${index}`}
              onDragEnd={({ data }) => {
                setPhotos(data);
                updateUserData({ photos: data });
              }}
              numColumns={3} // Ensure 3 columns
              contentContainerStyle={styles.photoGrid}
            />
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
  photosContainer: {
    flexDirection: "column",
    marginBottom: 16,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
  photoGrid: {
    justifyContent: "space-between",
  },
  photoContainer: {
    flex: 1,
    marginBottom: 16,
    position: "relative",
    width: "100%",
    maxWidth: 120,
    padding: 5,
  },
  photoTouchable: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: 8,
    overflow: "hidden",
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
  // Add other styles as necessary...
});
