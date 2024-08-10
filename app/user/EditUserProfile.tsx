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
  ScrollView,
} from "react-native";
import { DraggableGrid } from "react-native-draggable-grid";
import * as ImagePicker from "expo-image-picker";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { useRouter } from "expo-router";
import UserField from "@/components/UserField";

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

  const handleFieldPress = (fieldName: string) => {
    router.push("/user/EditFieldScreen", { fieldName });
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

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
      >
        {tab === "Edit" && (
          <View style={styles.editContainer}>
            <View style={styles.photosContainer}>
              <DraggableGrid
                numColumns={3}
                renderItem={renderItem}
                data={photoData}
                disabledReSorted={false}
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
            </View>
            <View style={styles.fieldsContainer}>
              <UserField
                title="Identity"
                fieldName="Gender"
                value={userData.gender}
                isVisible={!userData.hiddenFields.gender}
                onPress={() => handleFieldPress("gender")}
              />
              <UserField
                title="Sexual Orientation"
                fieldName="Sexuality"
                value={userData.sexualOrientation}
                isVisible={!userData.hiddenFields.sexualOrientation}
                onPress={() => handleFieldPress("sexualOrientation")}
              />
              <UserField
                title="I'm Interested In"
                fieldName="Date Preferences"
                value={userData.datePreferences}
                isVisible={!userData.hiddenFields.datePreferences}
                onPress={() => handleFieldPress("datePreferences")}
              />
              <UserField
                title="My Virtues"
                fieldName="Work"
                value={userData.jobLocation}
                isVisible={!userData.hiddenFields.jobLocation}
                onPress={() => handleFieldPress("jobLocation")}
              />
              <UserField
                title="Job Title"
                fieldName="Job Title"
                value={userData.jobTitle}
                isVisible={!userData.hiddenFields.jobTitle}
                onPress={() => handleFieldPress("jobTitle")}
              />
              <UserField
                title="Education Level"
                fieldName="Education"
                value={userData.educationDegree}
                isVisible={!userData.hiddenFields.educationDegree}
                onPress={() => handleFieldPress("educationDegree")}
              />
            </View>
          </View>
        )}
        {tab === "View" && (
          <View style={styles.contentContainer}>
            {/* Add content for the View tab */}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  headerButton: {
    fontSize: 16,
    color: "#007AFF",
  },
  tabBar: {
    flexDirection: "row",
    marginBottom: 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#007AFF",
  },
  tabText: {
    fontSize: 16,
  },
  editContainer: {
    flex: 1,
  },
  photosContainer: {
    flexDirection: "row",
    marginBottom: 16,
  },
  photoList: {
    flex: 1,
  },
  photoContainer: {
    position: "relative",
    margin: 2,
  },
  photoWrapper: {
    width: "100%",
    aspectRatio: 1,
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  removePhotoIcon: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 12,
    padding: 4,
  },
  fieldsContainer: {
    marginTop: 16,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
});
