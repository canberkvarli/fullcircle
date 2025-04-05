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

  const fullCircleSubscription = userData?.fullCircleSubscription || false;

  const formatValue = (value: any, defaultValue = "Open to All") => {
    if (Array.isArray(value)) {
      return value.length === 0
        ? defaultValue
        : value.join(", ").length > 40
          ? `${value.join(", ").slice(0, 40)}...`
          : value.join(", ");
    }

    // Check if the value contains a number followed by a unit (e.g., "miles", "km")
    if (typeof value === "string" && /[\d]+(\s*[\w]+)?/.test(value)) {
      const match = value.match(/[\d]+/);
      if (match) {
        return `${match[0]} ${value.replace(match[0], "").trim()}`;
      }
    }

    return value || defaultValue;
  };

  const preferences = [
    {
      label: "I'm Interested In",
      value: userData?.matchPreferences?.datePreferences,
      isSubscriberField: false,
      fieldName: "datePreferences",
    },
    {
      label: "Preferred Ethnicities",
      value: userData?.matchPreferences?.preferredEthnicities,
      isSubscriberField: false,
      fieldName: "preferredEthnicities",
    },
    {
      label: "Preferred Age Range",
      value: userData?.matchPreferences?.preferredAgeRange
        ? `${userData.matchPreferences.preferredAgeRange.min || 18} - ${
            userData.matchPreferences.preferredAgeRange.max || 70
          }`
        : "18 - 70",
      isSubscriberField: false,
      fieldName: "preferredAgeRange",
    },
    {
      label: "Maximum Distance",
      value: `${userData?.matchPreferences?.preferredDistance || 100}`,
      isSubscriberField: false,
      fieldName: "preferredDistance",
    },
    {
      label: "Preferred Height Range",
      value: userData?.matchPreferences?.preferredHeightRange
        ? `${userData.matchPreferences.preferredHeightRange.min || 3} - ${
            userData.matchPreferences.preferredHeightRange.max || 8
          }`
        : "3 - 8",
      isSubscriberField: true,
      fieldName: "preferredHeightRange",
    },
    {
      label: "Preferred Ethnicity",
      value: userData?.matchPreferences?.preferredEthnicities,
      isSubscriberField: true,
      fieldName: "preferredEthnicities",
    },
  ];

  const handleEditField = (fieldName: string, currentValue: any) => {
    if (fieldName === "preferredAgeRange" && typeof currentValue === "string") {
      // Parse it into an object if it's a string
      currentValue = {
        min: parseInt(currentValue.split(" - ")[0], 10),
        max: parseInt(currentValue.split(" - ")[1], 10),
      };
    } else if (
      fieldName === "preferredDistance" &&
      typeof currentValue === "string"
    ) {
      // Parse it into an object if it's a string
      currentValue = parseInt(currentValue, 10);
    }
    router.navigate({
      pathname: "/user/edit/EditPreferenceField",
      params: { fieldName, currentValue: JSON.stringify(currentValue) },
    });
  };

  const renderPreferenceItem = (
    label: string,
    value: any,
    isSubscriberField: boolean,
    fieldName: string
  ) => (
    <TouchableOpacity
      style={styles.fieldContainer}
      onPress={() =>
        isSubscriberField && !fullCircleSubscription
          ? router.navigate("/user/FullCircleSubscription")
          : handleEditField(fieldName, value)
      }
    >
      <View style={styles.fieldContent}>
        <View>
          <Text style={styles.fieldLabel}>{label}</Text>
          <Text style={styles.fieldValue}>{formatValue(value)}</Text>
        </View>
        {isSubscriberField && !fullCircleSubscription && (
          <Icon name="lock" size={18} color="black" />
        )}
      </View>
    </TouchableOpacity>
  );

  const handleClose = () => {
    router.back();
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

        {preferences
          .filter((pref) => !pref.isSubscriberField)
          .map(({ label, value, isSubscriberField, fieldName }) => (
            <React.Fragment key={fieldName}>
              {renderPreferenceItem(label, value, isSubscriberField, fieldName)}
            </React.Fragment>
          ))}

        <Text style={styles.mainTitle}>Subscriber Preferences</Text>
        <View style={styles.separator} />

        {!fullCircleSubscription && (
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

        {preferences
          .filter((pref) => pref.isSubscriberField)
          .map(({ label, value, isSubscriberField, fieldName }) => (
            <React.Fragment key={fieldName}>
              {renderPreferenceItem(label, value, isSubscriberField, fieldName)}
            </React.Fragment>
          ))}
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
