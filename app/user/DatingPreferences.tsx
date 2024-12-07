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
import { useRouter, Link } from "expo-router";

export default function DatingPreferences() {
  const router = useRouter();
  const { userData } = useUserContext();

  const preferredEthnicities =
    userData.matchPreferences?.preferredEthnicities || [];
  const datePreferences = userData.matchPreferences?.datePreferences || [];
  const preferredAgeRange = userData.matchPreferences?.preferredAgeRange;
  const preferredDistance = userData.matchPreferences?.preferredDistance || 100;
  const fullCircleSubscription = userData.fullCircleSubscription || false;

  // Handle navigation to edit a specific field
  const handleEditField = (fieldName: string, currentValue: any) => {
    router.navigate({
      pathname: "/user/edit/EditPreferenceField",
      params: { fieldName, currentValue },
    });
  };

  // Handle closing the current screen
  const handleClose = () => {
    router.back();
  };

  const renderPreferenceItem = (
    label: string,
    value: any,
    fullCircleSubscription: boolean,
    isSubscriberField: boolean,
    onPress: () => void
  ) => {
    const displayValue = Array.isArray(value)
      ? value.length === 0
        ? "Open to All"
        : value.join(", ").length > 40
        ? `${value.join(", ").slice(0, 40)}...`
        : value.join(", ")
      : value || "Open to All";

    return (
      <TouchableOpacity style={styles.fieldContainer} onPress={onPress}>
        <View style={styles.fieldContent}>
          <View>
            <Text style={styles.fieldLabel}>{label}</Text>
            <Text style={styles.fieldValue}>{displayValue}</Text>
          </View>
          {isSubscriberField && !fullCircleSubscription && (
            <Icon name="lock" size={18} color="black" />
          )}
        </View>
      </TouchableOpacity>
    );
  };

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

        {/* Basic fields */}
        {renderPreferenceItem(
          "I'm Interested In",
          datePreferences,
          fullCircleSubscription,
          false,
          () => handleEditField("datePreferences", datePreferences)
        )}

        {renderPreferenceItem(
          "Preferred Ethnicities",
          preferredEthnicities,
          fullCircleSubscription,
          false,
          () => handleEditField("preferredEthnicities", preferredEthnicities)
        )}

        {renderPreferenceItem(
          "Preferred Age Range",
          preferredAgeRange
            ? `${preferredAgeRange.min || "18"} - ${
                preferredAgeRange.max || "30"
              }`
            : "18 - 30",
          fullCircleSubscription,
          false,
          () => handleEditField("preferredAgeRange", preferredAgeRange)
        )}

        {renderPreferenceItem(
          "Maximum Distance",
          `${userData.matchPreferences?.preferredDistance} miles`,
          fullCircleSubscription,
          false,
          () => handleEditField("preferredDistance", preferredDistance)
        )}
        <Text style={styles.mainTitle}>Subscriber Preferences</Text>
        <View style={styles.separator} />

        {/* Upgrade prompt if not a FullCircle subscriber */}
        {fullCircleSubscription === false && (
          <View style={styles.subscribeContainer}>
            <Link
              style={styles.subscribeButton}
              href={{ pathname: "/user/FullCircleSubscription" }}
            >
              <Text style={styles.subscribeText}>Upgrade</Text>
            </Link>
            <Text style={styles.subscribeDescription}>
              Fine-tune your preferences with FullCircle.
            </Text>
          </View>
        )}

        {/* Premium fields (visible to FullCircle users) */}
        {renderPreferenceItem(
          "Age Range",
          `${userData.matchPreferences?.preferredAgeRange?.min || "18"} - ${
            userData.matchPreferences?.preferredAgeRange?.max || "30"
          }`,
          fullCircleSubscription,
          true,
          () =>
            handleEditField(
              "ageRange",
              userData.matchPreferences?.preferredAgeRange
            )
        )}

        {renderPreferenceItem(
          "Preferred Ethnicity",
          userData.matchPreferences?.preferredEthnicities?.length === 0
            ? "Open to All"
            : userData.matchPreferences?.preferredEthnicities?.join(", "),
          fullCircleSubscription,
          true,
          () =>
            handleEditField(
              "preferredEthnicities",
              userData.matchPreferences?.preferredEthnicities
            )
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
    marginBottom: 10,
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
