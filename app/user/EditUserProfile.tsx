// @ts-nocheck // workaround for the draggable grid.
import React, { useState, useEffect } from "react";
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
import EditUserProfileField from "@/components/EditUserProfileField";

export default function EditUserProfile() {
  const { userData, updateUserData } = useUserContext();
  const [photos, setPhotos] = useState<string[]>(userData.photos || []);
  const [tab, setTab] = useState("Edit");
  const router = useRouter();
  const [isModified, setIsModified] = useState(false);
  const [fieldVisibility, setFieldVisibility] = useState({});

  useEffect(() => {
    // Initialize field visibility based on hiddenFields
    const initialVisibility = {
      Gender: !userData.hiddenFields?.Gender,
      Sexuality: !userData.hiddenFields?.sexualOrientation,
      "I'm Interested In": !userData.hiddenFields?.datePreferences,
      Work: !userData.hiddenFields?.jobLocation,
      "Job Title": !userData.hiddenFields?.jobTitle,
      "Education Level": !userData.hiddenFields?.educationDegree,
      Name: true,
      Age: true,
      Height: true,
      Location: true,
      Ethnicities: true,
      "Children Preference": true,
      "Spiritual Practices": true,
    };

    setFieldVisibility(initialVisibility);
  }, [userData]);

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
    router.push({
      pathname: "/user/EditFieldScreen" as any,
      params: { fieldName },
    });
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
      console.log("nothing to discard");
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

  const IdentityFields = [
    {
      fieldName: "Gender",
      value: userData.Gender,
      isVisible: !userData.hiddenFields?.Gender,
    },
    {
      fieldName: "Sexuality",
      value: userData.sexualOrientation,
      isVisible: !userData.hiddenFields?.sexualOrientation,
    },
    {
      fieldName: "I'm Interested In",
      value: userData.datePreferences,
      isVisible: !userData.hiddenFields?.datePreferences,
    },
  ];

  const MyVirtuesFields = [
    {
      fieldName: "Work",
      value: userData.jobLocation,
      isVisible: !userData.hiddenFields?.jobLocation,
    },
    {
      fieldName: "Job Title",
      value: userData.jobTitle,
      isVisible: !userData.hiddenFields?.jobTitle,
    },
    {
      fieldName: "Education Level",
      value: userData.educationDegree,
      isVisible: !userData.hiddenFields?.educationDegree,
    },
  ];

  // Additional user info for sections
  const vitalFields = [
    {
      fieldName: "Name",
      value: `${userData.firstName} ${userData.lastName}`,
    },
    {
      fieldName: "Age",
      value: userData.age,
    },
    {
      fieldName: "Height",
      value: userData.height,
    },
    {
      fieldName: "Location",
      value: userData.location?.city,
    },
    {
      fieldName: "Ethnicities",
      value: userData.ethnicities,
    },
    {
      fieldName: "Children Preference",
      value: userData.childrenPreference,
    },
  ];

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
              {/* IdentityFields Section */}
              <Text style={styles.mainTitle}>Identity</Text>
              <View style={styles.separator} />
              {IdentityFields.map((field) => (
                <EditUserProfileField
                  key={field.fieldName}
                  title={field.title}
                  fieldName={field.fieldName}
                  value={field.value}
                  onPress={() => handleFieldPress(field.fieldName)}
                  isVisible={fieldVisibility[field.fieldName]}
                />
              ))}
            </View>
            <View style={styles.fieldsContainer}>
              {/* My Virtues Section */}
              <Text style={styles.mainTitle}>My Virtues</Text>
              <View style={styles.separator} />
              {MyVirtuesFields.map((field) => (
                <EditUserProfileField
                  key={field.fieldName}
                  title={field.title}
                  fieldName={field.fieldName}
                  value={field.value}
                  isVisible={fieldVisibility[field.fieldName]}
                  onPress={() => handleFieldPress(field.fieldName)}
                />
              ))}
            </View>
            <View style={styles.fieldsContainer}>
              {/* My Vitals Section */}
              <Text style={styles.mainTitle}>My Vitals</Text>
              <View style={styles.separator} />
              {vitalFields.map((field, index) => (
                <EditUserProfileField
                  key={index}
                  title={field.title}
                  fieldName={field.fieldName}
                  value={field.value}
                  isVisible={fieldVisibility[field.fieldName]}
                  onPress={() => handleFieldPress(field.title)}
                />
              ))}
            </View>
            <View style={styles.fieldsContainer}>
              {/* My Vices Section */}
              <Text style={styles.mainTitle}>My Vices</Text>
              <View style={styles.separator} />
              <EditUserProfileField
                fieldName="Spirituality"
                value={userData.spiritualPractices}
                isVisible={true}
                onPress={() => handleFieldPress("Spirituality")}
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
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
  },
  separator: {
    height: 1,
    backgroundColor: "lightgray",
    marginVertical: 8,
  },
  contentContainer: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
});
