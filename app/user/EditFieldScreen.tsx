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
  const [isVisible, setIsVisible] = useState(isHidden);
  const [customInput, setCustomInput] = useState("");

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
    }
  }, [fieldName, currentFieldValue]);

  const fieldTitleMap: Record<string, string> = {
    gender: "Gender",
    sexualOrientation: "Sexuality",
    datePreferences: "Date Preference",
    childrenPreference: "Children Preference",
  };

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
      </ScrollView>
      <TouchableOpacity
        style={styles.checkboxContainer}
        onPress={() => setIsVisible(!isVisible)}
      >
        <Checkbox
          value={isVisible}
          onValueChange={() => setIsVisible(!isVisible)}
        />
        <Text style={styles.checkboxLabel}>Visible on profile</Text>
      </TouchableOpacity>
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
  scrollContainer: {
    flexGrow: 1, // Ensure ScrollView can grow
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 16,
  },
  optionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  optionText: {
    fontSize: 18,
  },
  optionSubtitle: {
    fontSize: 14,
    fontStyle: "italic",
  },
  input: {
    height: 40,
    borderBottomWidth: 1,
    borderBottomColor: "black",
    marginVertical: 8,
    fontSize: 16,
  },
  checkboxContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  checkboxLabel: {
    marginLeft: 12,
    fontSize: 16,
  },
});

export default EditFieldScreen;
