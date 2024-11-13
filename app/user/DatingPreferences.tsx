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
  const { fullCircleSubscription } = userData;

  const handlePreferenceField = (fieldName: string) => {
    // navigation.navigate("EditField", { fieldName });
  };

  const handleClose = () => {
    navigation.goBack();
  };

  const renderPreferenceItem = (
    label: string,
    value: any,
    fullCircleSubscription: boolean,
    isSubscriberField: boolean,
    onPress: () => void
  ) => (
    <TouchableOpacity style={styles.fieldContainer} onPress={onPress}>
      <View style={styles.fieldContent}>
        <View>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>
            {Array.isArray(value)
              ? value.join(", ").length > 40
                ? `${value.join(", ").slice(0, 40)}...`
                : value.join(", ")
              : value || "Not specified"}
          </Text>
        </View>
        {isSubscriberField ? (
          String(fullCircleSubscription) === "true" ? (
            <Icon name="chevron-right" size={18} color="black" />
          ) : (
            <Icon name="lock" size={18} color="black" />
          )
        ) : (
          <Icon name="chevron-right" size={18} color="black" />
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dating Preferences</Text>
        <TouchableOpacity onPress={handleClose}>
          <Icon name="close" size={22} color="black" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.mainTitle}>Member Preferences</Text>
        <View style={styles.separator} />

        {renderPreferenceItem(
          "I'm Interested In",
          userData.sexualOrientation,
          userData.fullCircleSubscription,
          false,
          () => handlePreferenceField("gender")
        )}
        {renderPreferenceItem(
          "My Neighborhood",
          userData.location?.city,
          userData.fullCircleSubscription,
          false,
          () => handlePreferenceField("location")
        )}
        {renderPreferenceItem(
          "Maximum Distance",
          userData.preferredDistance,
          userData.fullCircleSubscription,
          false,
          () => handlePreferenceField("maxDistance")
        )}
        {renderPreferenceItem(
          "Age Range",
          `${userData.preferredAgeRange?.min || "18"} - ${
            userData.preferredAgeRange?.max || "30"
          }`,
          userData.fullCircleSubscription,
          false,
          () => handlePreferenceField("ageRange")
        )}
        {renderPreferenceItem(
          "Ethnicity",
          userData.ethnicities,
          userData.fullCircleSubscription,
          false,
          () => handlePreferenceField("ethnicity")
        )}
        {renderPreferenceItem(
          "Relationship Type",
          userData.datePreferences?.join(", "),
          userData.fullCircleSubscription,
          false,
          () => handlePreferenceField("relationshipType")
        )}

        <Text style={styles.mainTitle}>Subscriber Preferences</Text>
        <View style={styles.separator} />

        {String(fullCircleSubscription) === "false" && (
          <View style={styles.subscribeContainer}>
            <TouchableOpacity style={styles.subscribeButton}>
              <Text style={styles.subscribeText}>Upgrade</Text>
            </TouchableOpacity>
            <Text style={styles.subscribeDescription}>
              Fine-tune your preferences in a more spiritual way with a
              subscription.
            </Text>
          </View>
        )}

        {renderPreferenceItem(
          "I'm Interested In",
          userData.sexualOrientation,
          fullCircleSubscription,
          true,
          () => handlePreferenceField("gender")
        )}
        {renderPreferenceItem(
          "My Neighborhood",
          userData.location?.city,
          fullCircleSubscription,
          true,
          () => handlePreferenceField("location")
        )}
        {renderPreferenceItem(
          "Maximum Distance",
          userData.preferredDistance,
          fullCircleSubscription,
          true,
          () => handlePreferenceField("maxDistance")
        )}
        {renderPreferenceItem(
          "Age Range",
          `${userData.preferredAgeRange?.min || "18"} - ${
            userData.preferredAgeRange?.max || "30"
          }`,
          fullCircleSubscription,
          true,
          () => handlePreferenceField("ageRange")
        )}
        {renderPreferenceItem(
          "Ethnicity",
          userData.ethnicities,
          fullCircleSubscription,
          true,
          () => handlePreferenceField("ethnicity")
        )}
        {renderPreferenceItem(
          "Relationship Type",
          userData.datePreferences?.join(", "),
          fullCircleSubscription,
          true,
          () => handlePreferenceField("relationshipType")
        )}
      </ScrollView>
    </View>
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
    color: "black",
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fieldContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "black",
  },
  fieldValue: {
    fontSize: 16,
    color: "#4A4A4A",
    marginTop: 4,
  },
  chevronIcon: {
    marginLeft: "auto",
  },
  subscribeContainer: {
    backgroundColor: "#F9E3F8",
    borderRadius: 8,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  subscribeButton: {
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: "white",
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "purple",
    marginRight: 10,
  },
  subscribeText: {
    color: "purple",
    fontSize: 16,
    fontWeight: "bold",
  },
  subscribeDescription: {
    color: "black",
    fontSize: 14,
    maxWidth: "70%",
  },
});
