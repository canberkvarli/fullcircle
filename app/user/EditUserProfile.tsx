// @ts-nocheck // workaround for the draggable grid.
import React, { useState, useEffect } from "react";
import {
  Text,
  View,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  ScrollView,
} from "react-native";
import styles from "@/styles/User/EditUserProfileStyles";
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
      gender: !userData.hiddenFields?.gender,
      sexualOrientation: !userData.hiddenFields?.sexualOrientation,
      datePreferences: !userData.hiddenFields?.datePreferences,
      jobLocation: !userData.hiddenFields?.jobLocation,
      jobTitle: !userData.hiddenFields?.jobTitle,
      educationDegree: !userData.hiddenFields?.educationDegree,
      firstName: true,
      lastName: true,
      fullName: true,
      age: true,
      height: !userData.hiddenFields?.height,
      location: true,
      ethnicities: true,
      childrenPreference: true,
      spiritualPractices: true,
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
      pathname: "/user/EditFieldScreen",
      params: { fieldName },
    });
  };

  const renderField = (field: any) => {
    return (
      <EditUserProfileField
        key={field.fieldName}
        title={field.title}
        fieldName={field.fieldName}
        value={field.value}
        isVisible={fieldVisibility[field.fieldName]}
        onPress={() => handleFieldPress(field.fieldName)}
      />
    );
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

  const IdentityFields = [
    {
      fieldName: "gender",
      title: "Gender",
      value: userData.gender,
    },
    {
      fieldName: "sexualOrientation",
      title: "Sexuality",
      value: userData.sexualOrientation,
    },
    {
      fieldName: "datePreferences",
      title: "I'm Interested In",
      value: userData.datePreferences,
    },
  ];

  const MyVirtuesFields = [
    {
      fieldName: "jobLocation",
      title: "Work",
      value: userData.jobLocation,
    },
    {
      fieldName: "jobTitle",
      title: "Job Title",
      value: userData.jobTitle,
    },
    {
      fieldName: "educationDegree",
      title: "Education Level",
      value: userData.educationDegree,
    },
  ];

  // Additional user info for sections
  const vitalFields = [
    {
      fieldName: "fullName",
      title: "Name",
      value: userData.fullName || userData.firstName, // Fall back to firstName if fullName is not available
    },
    {
      fieldName: "age",
      title: "Age",
      value: userData.age,
    },
    {
      fieldName: "height",
      title: "Height",
      value: userData.height,
    },
    {
      fieldName: "location",
      title: "Location",
      value: userData.location?.city,
    },
    {
      fieldName: "ethnicities",
      title: "Ethnicities",
      value: userData.ethnicities,
    },
    {
      fieldName: "childrenPreference",
      title: "Children Preference",
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
              <Text style={styles.mainTitle}>Identity</Text>
              <View style={styles.separator} />
              {IdentityFields.map(renderField)}
            </View>
            <View style={styles.fieldsContainer}>
              <Text style={styles.mainTitle}>My Virtues</Text>
              <View style={styles.separator} />
              {MyVirtuesFields.map(renderField)}
            </View>
            <View style={styles.fieldsContainer}>
              <Text style={styles.mainTitle}>My Vitals</Text>
              <View style={styles.separator} />
              {vitalFields.map(renderField)}
            </View>
            <View style={styles.fieldsContainer}>
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
