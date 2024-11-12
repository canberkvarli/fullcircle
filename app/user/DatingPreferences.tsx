import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import { useUserContext } from "@/context/UserContext";
import { useNavigation } from "@react-navigation/native";

export default function DatingPreferences() {
  const navigation = useNavigation();
  const { userData } = useUserContext();

  const handlePreferenceField = (fieldName: string) => {
    // navigation.navigate("EditField", { fieldName });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderPreferenceItem = (
    label: string,
    value: any,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.fieldContainer} onPress={onPress}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Text style={styles.fieldValue}>{value || "Not specified"}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dating Preferences</Text>
        <TouchableOpacity onPress={handleClose}>
          <Icon name="close" size={24} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.mainTitle}>Member Preferences</Text>
        <View style={styles.separator} />

        {renderPreferenceItem(
          "I'm Interested In",
          userData.sexualOrientation,
          () => handlePreferenceField("gender")
        )}
        {renderPreferenceItem("My Neighborhood", userData.location?.city, () =>
          handlePreferenceField("location")
        )}
        {renderPreferenceItem(
          "Maximum Distance",
          userData.preferredDistance,
          () => handlePreferenceField("maxDistance")
        )}
        {renderPreferenceItem(
          "Age Range",
          `${userData.preferredAgeRange?.min || "18"} - ${
            userData.preferredAgeRange?.max || "30"
          }`,
          () => handlePreferenceField("ageRange")
        )}

        <Text style={styles.mainTitle}>Subscriber Preferences</Text>
        <View style={styles.separator} />

        <TouchableOpacity style={styles.subscribeButton}>
          <Text style={styles.subscribeText}>
            Upgrade to fine-tune your preferences
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
    backgroundColor: "white",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  scrollView: {
    paddingBottom: 16,
  },
  mainTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "gray",
    marginVertical: 12,
  },
  separator: {
    height: 1,
    backgroundColor: "lightgray",
    marginVertical: 8,
  },
  fieldContainer: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "lightgray",
    marginBottom: 10,
  },
  fieldLabel: {
    fontSize: 14,
    color: "gray",
  },
  fieldValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "black",
    marginTop: 4,
  },
  subscribeButton: {
    paddingVertical: 15,
    backgroundColor: "#4CAF50",
    borderRadius: 8,
    marginBottom: 20,
    alignItems: "center",
  },
  subscribeText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});
