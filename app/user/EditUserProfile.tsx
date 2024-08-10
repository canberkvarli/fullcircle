// @ts-nocheck // workaround for the draggable grid.
import React, { useState } from "react";
import {
  Text,
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
} from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";

export default function EditUserProfile() {
  const { userData, updateUserData } = useUserContext();
  const [photos, setPhotos] = useState<string[]>(userData.photos || []);
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
    }
  };

  const renderItem = (item: { key: string; uri: string }, order: number) => {
    return (
      <View style={styles.photoContainer} key={item.key}>
        <View style={styles.photoWrapper}>
          <Image source={{ uri: item.uri }} style={styles.photo} />
          <TouchableOpacity
            style={styles.removePhotoIcon}
            onPress={() => pickImage(order)}
          >
            <Icon name="times" size={12} color="white" />
          </TouchableOpacity>
        </View>
      </View>
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
      await updateUserData({ photos });
      setIsModified(false);
    }
    router.back();
  };

  const photoData = photos.map((uri, index) => ({
    key: `photo-${index}`,
    uri,
  }));

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
        <DraggableGrid
          numColumns={3}
          renderItem={renderItem}
          data={photoData}
          disabledReSorted={true}
          onDragRelease={(data) => {
            const updatedPhotos = data.map((item) => item.uri);
            setPhotos(updatedPhotos);
            setIsModified(true);
          }}
          dragItemFlex={1}
          dragAreaFlex={1}
          hoverStyle={{ scale: 1.05 }}
          style={styles.photoList}
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
    marginTop: 16,
  },
  photoContainer: {
    padding: 5,
    alignItems: "center",
    justifyContent: "center",
  },
  photoWrapper: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "flex-end",
    width: 100,
    height: 100,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#eee",
  },
  photo: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  removePhotoIcon: {
    backgroundColor: "rgba(0,0,0,0.6)",
    borderRadius: 12,
    padding: 4,
    zIndex: 1,
    alignSelf: "flex-end",
    margin: 4,
    bottom: 77,
    left: 5,
  },
  contentContainer: {
    flex: 1,
    padding: 16,
  },
});
