import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  TextInput,
  ScrollView,
} from "react-native";
import Checkbox from "expo-checkbox";
import { useUserContext } from "@/context/UserContext";
import { useRouter, useLocalSearchParams } from "expo-router";
import Icon from "react-native-vector-icons/FontAwesome";

const options = {
  gender: [
    { title: "Man", subtitle: "Radiate your masculine energy" },
    { title: "Woman", subtitle: "Embrace your feminine essence" },
    { title: "Non-binary" },
    { title: "Genderqueer" },
    { title: "Agender" },
    { title: "Two-Spirit", subtitle: "Honor your sacred duality" },
    {
      title: "Other",
      subtitle: "Describe your unique path",
      input: true,
    },
  ],
  sexualOrientation: [
    "Straight",
    "Gay",
    "Lesbian",
    "Bisexual",
    "Asexual",
    "Demisexual",
    "Pansexual",
    "Queer",
    "Questioning",
    {
      title: "Other",
      subtitle: "Describe your unique path",
      input: true,
    },
  ],
  datePreferences: ["Men", "Women", "Everyone"],
  childrenPreference: [
    "Don’t have children",
    "Have children",
    "Open to children",
    "Want Children",
  ],
  educationLevels: [
    "High School",
    "Undergrad",
    "Postgrad",
    "Associate Degree",
    "Bachelor's Degree",
    "Master's Degree",
    "Doctorate",
    "Professional Certification",
  ],
};

function EditFieldScreen() {
  const router = useRouter();
  const { updateUserData, userData } = useUserContext();
  const { fieldName } = useLocalSearchParams();

  const currentFieldValue = (userData as any)[fieldName as string] || null;
  const isHidden =
    (userData.hiddenFields as any)?.[fieldName as string] === false;

  const [selectedGender, setSelectedGender] = useState<string | null>(null);
  const [selectedOrientations, setSelectedOrientations] = useState<string[]>(
    []
  );
  const [selectedDatePreferences, setSelectedDatePreferences] = useState<
    string[]
  >([]);
  const [isVisible, setIsVisible] = useState(isHidden);
  const [customInput, setCustomInput] = useState("");

  // New state variables for Job Location and Job Title
  const [jobLocation, setJobLocation] = useState(currentFieldValue || "");
  const [jobTitle, setJobTitle] = useState(currentFieldValue || "");

  const fieldTitleMap: Record<string, string> = {
    gender: "Gender",
    sexualOrientation: "Sexuality",
    datePreferences: "Date Preference",
    childrenPreference: "Children Preference",
    jobLocation: "Work Location",
    jobTitle: "Job Title",
  };

  useEffect(() => {
    if (fieldName === "gender") {
      if (options.gender.some((option) => option.title === currentFieldValue)) {
        setSelectedGender(currentFieldValue);
        setCustomInput("");
      } else if (currentFieldValue) {
        setSelectedGender("Other");
        setCustomInput(currentFieldValue);
      }
    } else if (fieldName === "sexualOrientation") {
      const orientations = Array.isArray(currentFieldValue)
        ? currentFieldValue
        : [];
      setSelectedOrientations(orientations);
    } else if (fieldName === "datePreferences") {
      const preferences = Array.isArray(currentFieldValue)
        ? currentFieldValue
        : [];
      setSelectedDatePreferences(preferences);
    } else if (fieldName === "jobLocation") {
      setJobLocation(currentFieldValue || "");
    } else if (fieldName === "jobTitle") {
      setJobTitle(currentFieldValue || "");
    }
  }, [fieldName, currentFieldValue]);

  const handleSave = async () => {
    let newFieldValue;

    if (fieldName === "gender") {
      if (selectedGender === "Other" && customInput.trim() === "") {
        alert("Please provide a value for your gender.");
        return;
      }
      newFieldValue = selectedGender === "Other" ? customInput : selectedGender;
    } else if (fieldName === "sexualOrientation") {
      newFieldValue = selectedOrientations;
    } else if (fieldName === "datePreferences") {
      newFieldValue = selectedDatePreferences;
    } else if (fieldName === "jobLocation") {
      newFieldValue = jobLocation;
    } else if (fieldName === "jobTitle") {
      newFieldValue = jobTitle;
    }

    const isModified =
      newFieldValue !== currentFieldValue || isVisible !== isHidden;

    if (fieldName === "gender" && !selectedGender) {
      alert(`Please select a ${fieldName} or provide a custom value.`);
      return;
    }

    if (
      fieldName === "sexualOrientation" &&
      selectedOrientations.length === 0
    ) {
      alert(`Please select at least one ${fieldName}.`);
      return;
    }

    if (isModified) {
      await updateUserData({
        [fieldName as string]: newFieldValue,
        hiddenFields: {
          ...userData.hiddenFields,
          [fieldName as string]: !isVisible,
        },
      });
    }

    router.back();
  };

  const handleDatePreferenceSelection = (title: string) => {
    if (title === "Everyone") {
      if (
        selectedDatePreferences.includes("Men") ||
        selectedDatePreferences.includes("Women")
      ) {
        setSelectedDatePreferences(["Everyone"]);
      } else {
        setSelectedDatePreferences((prev) =>
          prev.includes("Everyone") ? [] : ["Everyone"]
        );
      }
    } else {
      const newPreferences = selectedDatePreferences.includes(title)
        ? selectedDatePreferences.filter((pref) => pref !== title)
        : [...selectedDatePreferences, title];

      if (newPreferences.includes("Men") && newPreferences.includes("Women")) {
        setSelectedDatePreferences([title]);
      } else {
        setSelectedDatePreferences(newPreferences);
      }

      if (newPreferences.includes("Men") || newPreferences.includes("Women")) {
        setSelectedDatePreferences(
          newPreferences.filter((pref) => pref !== "Everyone")
        );
      }
    }
  };

  const renderOption = (
    option:
      | {
          title: string;
          subtitle?: string;
          input?: boolean;
        }
      | string
  ) => {
    const title = typeof option === "string" ? option : option.title;
    const subtitle = typeof option === "string" ? null : option.subtitle;
    const input = typeof option === "string" ? false : option.input;

    return (
      <TouchableOpacity
        style={styles.optionContainer}
        onPress={() => {
          if (fieldName === "gender") {
            if (title === "Other") {
              setSelectedGender("Other");
              setCustomInput("");
            } else {
              setSelectedGender(title);
              setCustomInput("");
            }
          } else if (fieldName === "sexualOrientation") {
            if (selectedOrientations.includes(title)) {
              setSelectedOrientations((prev) =>
                prev.filter((orientation) => orientation !== title)
              );
            } else {
              setSelectedOrientations((prev) => [...prev, title]);
            }
          } else if (fieldName === "datePreferences") {
            handleDatePreferenceSelection(title);
          }
        }}
      >
        <View>
          <Text style={styles.optionText}>{title}</Text>
          {subtitle && <Text style={styles.optionSubtitle}>{subtitle}</Text>}
          {input && selectedGender === "Other" && (
            <TextInput
              style={styles.input}
              placeholder="Enter here"
              value={customInput}
              onChangeText={setCustomInput}
            />
          )}
        </View>
        <Checkbox
          value={
            fieldName === "gender"
              ? selectedGender === title
              : fieldName === "datePreferences"
              ? selectedDatePreferences.includes(title)
              : selectedOrientations.includes(title)
          }
          onValueChange={() => {
            // Handle checkbox state change here
          }}
        />
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={handleSave}>
        <Icon name="chevron-left" size={24} color="black" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>
        {fieldTitleMap[fieldName as string] ||
          (typeof fieldName === "string"
            ? fieldName
                .replace(/([A-Z])/g, " $1")
                .replace(/^./, (str) => str.toUpperCase())
            : fieldName)}
      </Text>

      <ScrollView style={styles.scrollContainer}>
        {(fieldName === "jobLocation" || fieldName === "jobTitle") && (
          <TextInput
            style={styles.input}
            placeholder={`Enter ${fieldTitleMap[fieldName as string]}`}
            value={fieldName === "jobLocation" ? jobLocation : jobTitle}
            onChangeText={
              fieldName === "jobLocation" ? setJobLocation : setJobTitle
            }
          />
        )}

        {fieldName !== "jobLocation" && fieldName !== "jobTitle" && (
          <FlatList
            data={
              options[fieldName as keyof typeof options] as Array<
                string | { title: string; subtitle?: string; input?: boolean }
              >
            }
            renderItem={({ item }) => renderOption(item)}
            keyExtractor={(item) =>
              typeof item === "string" ? item : item.title
            }
            scrollEnabled={false}
          />
        )}
      </ScrollView>

      <View style={styles.toggleContainer}>
        <Text style={styles.toggleText}>
          {isVisible ? "Visible" : "Hidden"}
        </Text>
        <TouchableOpacity onPress={() => setIsVisible((prev) => !prev)}>
          <Icon
            name={isVisible ? "eye" : "eye-slash"}
            size={24}
            color="black"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    marginTop: 25,
    justifyContent: "flex-start",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  scrollContainer: {
    flex: 1,
  },
  input: {
    borderWidth: 1,
    borderColor: "gray",
    borderRadius: 8,
    padding: 8,
    marginVertical: 8,
  },
  optionContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  optionText: {
    fontSize: 16,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#666",
  },
  toggleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#ccc",
  },
  toggleText: {
    fontSize: 16,
  },
});

export default EditFieldScreen;
