import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import DraggableFlatList, {
  RenderItemParams,
  ScaleDecorator,
} from "react-native-draggable-flatlist";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";

export default function EditUserProfile() {
  const { userData, updateUserData } = useUserContext();
  const [photos, setPhotos] = useState<string[]>(userData.photos || []);
  const [originalPhotos, setOriginalPhotos] = useState<string[]>(
    userData.photos || []
  );
  const [tab, setTab] = useState("Edit");
  const router = useRouter();
  const [isModified, setIsModified] = useState(false);

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
      setIsModified(true);
      updateUserData({ photos: updatedPhotos });
    }
  };

  const renderItem = ({
    item,
    drag,
    isActive,
    getIndex,
  }: RenderItemParams<(typeof photos)[0]>) => {
    const index = getIndex?.() ?? 0;
    return (
      <ScaleDecorator>
        <TouchableOpacity
          onLongPress={drag}
          disabled={isActive}
          style={[
            styles.photoContainer,
            { backgroundColor: isActive ? "#f0f0f0" : "transparent" },
          ]}
        >
          <Image source={{ uri: item }} style={styles.photo} />
          <TouchableOpacity
            style={styles.removePhotoIcon}
            onPress={() => pickImage(index as any)}
          >
            <Icon name="camera" size={24} color="white" />
          </TouchableOpacity>
        </TouchableOpacity>
      </ScaleDecorator>
    );
  };

  const handleCancel = () => {
    if (isModified) {
      Alert.alert(
        "Discard Changes?",
        "You have unsaved changes. Do you want to discard them?",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Discard",
            onPress: () => router.back(),
          },
        ]
      );
    } else {
      router.back();
    }
  };

  const handleDone = async () => {
    if (isModified) {
      // Update Firestore with the new photo order
      await updateUserData({ photos });
      setIsModified(false);
    }
    router.back();
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleCancel}>
          <Text style={styles.headerButton}>Cancel</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{userData.firstName}</Text>
        <TouchableOpacity onPress={handleDone}>
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
        <DraggableFlatList
          data={photos}
          onDragEnd={({ data }) => {
            setPhotos(data);
            setIsModified(true);
            updateUserData({ photos: data }); // Update in Firestore immediately
          }}
          keyExtractor={(_item, index) => `draggable-item-${index}`}
          renderItem={renderItem}
          contentContainerStyle={styles.photoList}
        />
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
    padding: 16,
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
    color: "#007AFF",
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
    color: "#007AFF",
  },
  photoList: {
    flexGrow: 1,
  },
  photoContainer: {
    height: 100,
    marginVertical: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#eee",
    alignItems: "center",
    justifyContent: "center",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  removePhotoIcon: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});
